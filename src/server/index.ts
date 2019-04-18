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
import { developmentWebpackPlugin } from './plugins/development-webpack'

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

  await server.register([hapiAlive, inert, ssr])

  if (process.env.NODE_ENV === 'development') {
    await server.register([
      {
        options: {
          webpackConfig: require('../../webpack.config'),
        },
        plugin: developmentWebpackPlugin,
      },
    ])
  }

  server.route(publicDir)

  await server.initialize()

  return server
}

if (require.main === module) {
  getServer()
    .then(server => Promise.all([server, server.start()]))
    .then(([server]) => {
      console.log('Server running on', server.info.uri)
    })
}
