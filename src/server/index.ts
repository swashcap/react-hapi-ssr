import 'loud-rejection/register'
import dotenvSafe from 'dotenv-safe'

dotenvSafe.config()

import good from 'good'
import hapi from 'hapi'
import hapiAlive from 'hapi-alive'
import inert from 'inert'
import path from 'path'

import { publicDir } from './routes/public-dir'
import { ssr } from './plugins/ssr'
import { render } from './views/app'

const init = async () => {
  const server = new hapi.Server({
    port: process.env.PORT,
    routes: {
      files: {
        relativeTo: path.join(__dirname, '../../public'),
      },
    },
  })

  if (process.env.NODE !== 'test') {
    await server.register({
      plugin: good,
      options: {
        ops: {
          interval: 1000,
        },
        reporters: {
          myConsoleReporter: [
            {
              module: 'good-squeeze',
              name: 'Squeeze',
              args: [{ log: '*', response: '*' }],
            },
            {
              module: 'good-console',
            },
            'stdout',
          ],
        },
      },
    })
  }

  await Promise.all([
    server.register(hapiAlive),
    server.register(inert),
    server.register(ssr),
  ])

  server.route(publicDir)

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
      return h.response(render(request)).code(404)
    }

    return h.continue
  })

  await server.start()

  console.log('Server running on', server.info.uri)
}

init()
