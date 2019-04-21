import 'loud-rejection/register'
import dotenvSafe from 'dotenv-safe'

dotenvSafe.config()

import good from 'good'
import hapi from 'hapi'
import hapiAlive from 'hapi-alive'
import inert from 'inert'
import path from 'path'

import { buildFiles, publicFiles } from './routes/static-files'
import { ssr } from './plugins/ssr'
import { developmentHotReloadPlugin } from './plugins/development-hot-reload'
import { developmentWebpackPlugin } from './plugins/development-webpack'

const webpackConfig = require('../../webpack.config')

export const getServer = async () => {
  const server = new hapi.Server({
    port: process.env.PORT,
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

  await server.register([hapiAlive, inert])

  if (process.env.NODE_ENV === 'development') {
    await server.register([
      {
        options: {
          webpackConfig,
        },
        plugin: developmentWebpackPlugin,
      },
      {
        options: {
          paths: path.resolve(__dirname, '../**/*.js'),
        },
        plugin: developmentHotReloadPlugin,
      },
    ])
  } else {
    /**
     * Serve built assets when not in development.
     *
     * @todo Use nginx for non-application file serving.
     */
    server.route(buildFiles)
  }

  server.route(publicFiles)

  /**
   * Register after Webpack plugins so the ssr plugin has access to the Webpack
   * compiler during development.
   */
  await server.register({
    options: {
      isEnvDevelopment: process.env.NODE_ENV === 'development',
    },
    plugin: ssr,
  })

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
