import 'loud-rejection/register'
import dotenvSafe from 'dotenv-safe'

dotenvSafe.config()

import good from 'good'
import hapi from 'hapi'
import hapiAlive from 'hapi-alive'

import { ssr } from './routes/ssr'

const init = async () => {
  const server = new hapi.Server({
    port: process.env.PORT,
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

  await server.register(hapiAlive)

  server.route(ssr)

  await server.start()

  console.log('Server running on', server.info.uri)
}

init()
