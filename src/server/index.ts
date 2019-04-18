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
import { webpackPlugin } from './plugins/webpack'

export const getServer = async () => {
  const server = new hapi.Server({
    port: process.env.PORT,
    routes: {
      files: {
        relativeTo: path.join(__dirname, '../../public'),
      },
    },
  })

  if (process.env.NODE_ENV !== 'test') {
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
    process.env.NODE_ENV === 'development'
      ? server.register(webpackPlugin)
      : undefined,
  ])

  server.route(publicDir)

  return server
}

if (require.main === module) {
  getServer()
    .then(server => Promise.all([server, server.start()]))
    .then(([server]) => {
      console.log('Server running on', server.info.uri)
    })
}
