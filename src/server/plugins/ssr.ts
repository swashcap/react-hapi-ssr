import { Plugin, ServerRoute } from 'hapi'

import { routes } from '../../common/routes'
import { render } from '../views/app'

const handler: ServerRoute['handler'] = (request, h) =>
  h.response(render(request)).type('text/html')

export const ssr: Plugin<any> = {
  name: 'ssr',
  register(server) {
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
