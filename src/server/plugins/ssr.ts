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
  },
}
