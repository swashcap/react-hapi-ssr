import { ServerRoute } from 'hapi'

export const recordsApi: ServerRoute = {
  handler(request, h) {
    return h.continue
  },
  method: '*',
  options: {
    cors: true,
    description: 'RESTful API over a simple records database',
    tags: ['api'],
  },
  path: '/api/records',
}
