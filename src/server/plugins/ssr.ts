import { Plugin, Request, ServerRoute } from 'hapi'

import { routes } from '../../common/routes'
import {
  render as renderApp,
  renderScript,
  renderStylesheet,
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
}

export const ssr: Plugin<SSRPluginOptions> = {
  name: 'ssr',
  register(server, { isEnvDevelopment }) {
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

        return renderApp({
          options: {
            afterApp: scripts,
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
            afterApp: scripts,
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
     * Custom 404 page:
     * {@link https://github.com/hapijs/inert#customized-file-response}
     */
    server.ext('onPreResponse', (request, h) => {
      const { response } = request

      if (
        'isBoom' in response &&
        response.isBoom &&
        response.output.statusCode === 404
      ) {
        return h
          .response(render(request))
          .code(404)
          .type('text/html')
      }

      return h.continue
    })
  },
}
