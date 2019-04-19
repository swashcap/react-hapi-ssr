import { Plugin, ServerRoute } from 'hapi'
import { Configuration } from 'webpack'

import { routes } from '../../common/routes'
import { getRenderer } from '../views/app'

export interface SSRPluginOptions {
  webpackConfig: Configuration
}

export const ssr: Plugin<SSRPluginOptions> = {
  name: 'ssr',
  register(server, { webpackConfig }) {
    const render = getRenderer({
      afterApp: `<script src="${
        process.env.NODE_ENV === 'development'
          ? `${server.info.uri}/dist/main.bundle.js`
          : `${(webpackConfig as any).output.publicPath}main.bundle.js`
      }"></script>`,
    })

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
