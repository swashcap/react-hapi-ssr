import { Plugin, Request, ServerRoute } from 'hapi'
import boom from 'boom'

import { routes } from '../../common/routes'
import {
  render as renderApp,
  renderScript,
  renderStylesheet,
  RendererOptions,
} from '../views/app'

/**
 * Accepts the values of a Webpack manifest and converts then into `script`
 * or `link` tags suitable for the `head` element
 *
 * @todo Move to util module
 */
const getTags = (entries: string[]) => {
  let stylesheets = ''
  let scripts = ''

  entries.forEach(entry => {
    if (/\.js$/.test(entry)) {
      scripts += renderScript(entry)
    } else if (/\.css$/.test(entry)) {
      stylesheets += renderStylesheet(entry)
    }
  })

  return { scripts, stylesheets }
}

export type SSRPluginOptions = {
  isEnvDevelopment: boolean
  rendererOptions?: RendererOptions
}

export const ssr: Plugin<SSRPluginOptions> = {
  name: 'ssr',
  register(server, { isEnvDevelopment, rendererOptions = {} }) {
    let render: (request: Request) => ReturnType<typeof renderApp>

    if (isEnvDevelopment) {
      render = request => {
        /**
         * {@link} https://github.com/webpack/webpack-dev-middleware#server-side-rendering
         */
        const stats = (request.raw.res as any).locals.webpackStats.toJson()
        const prependPublicPath = (x: string) => `${stats.publicPath}${x}`

        const { scripts, stylesheets } = getTags(
          /**
           * The hot middleware changes the manifest value to an array and
           * pushes patches to it.
           */
          Object.values(stats.assetsByChunkName as Record<
            string,
            string | string[]
          >).reduce<string[]>((memo, entry) => {
            if (Array.isArray(entry)) {
              return [...memo, ...entry.map(prependPublicPath)]
            }
            return [...memo, prependPublicPath(entry)]
          }, []),
        )

        // TODO: Don't squash `rendererOptions`
        return renderApp({
          options: {
            ...rendererOptions,
            afterFooter: scripts,
            head: stylesheets,
          },
          request,
        })
      }
    } else {
      /**
       * Use Webpack's manifest of built files
       */
      const manifest = require('../../../dist/manifest.json') as Record<
        string,
        string
      >

      const { scripts, stylesheets } = getTags(Object.values(manifest))

      render = request =>
        renderApp({
          options: {
            ...rendererOptions,
            afterFooter: scripts,
            head: stylesheets,
          },
          request,
        })
    }

    const handler: ServerRoute['handler'] = (request, h) =>
      h.response(render(request)).type('text/html')

    Object.values(routes).forEach(route => {
      server.route({ ...route, handler })
    })

    /**
     * Custom 404 route:
     * {@link https://hapijs.com/tutorials/routing#user-content--404-handling}
     */
    server.route({
      handler(request, h) {
        if (
          request.headers.accept &&
          (request.headers.accept === '*/*' ||
            request.headers.accept.includes('text.html'))
        ) {
          return h
            .response(render(request))
            .code(404)
            .type('text/html')
        }

        throw boom.notFound()
      },
      method: '*',
      path: '/{any*}',
    })
  },
}
