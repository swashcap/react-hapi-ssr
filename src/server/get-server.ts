import good from 'good'
import hapi from 'hapi'
import hapiAlive from 'hapi-alive'
import inert from 'inert'

import { buildFiles, publicFiles } from './routes/static-files'
import { developmentWebpackPlugin } from './plugins/development-webpack'
import { recordsApi } from './routes/records-api'
import { recordsDBPlugin } from './plugins/records-db'
import { ssr } from './plugins/ssr'

export const getServer = async (
  serverOptions: hapi.ServerOptions = { port: process.env.PORT },
) => {
  const isEnvDevelopment = process.env.NODE_ENV === 'development'
  const server = new hapi.Server(serverOptions)

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

  if (isEnvDevelopment) {
    await server.register({
      options: {
        webpackConfig: require('../../webpack.config'),
      },
      plugin: developmentWebpackPlugin,
    })
  }

  await server.register([hapiAlive, inert, recordsDBPlugin])

  server.route(publicFiles)
  server.route(recordsApi)

  /**
   * Register after Webpack plugins so the ssr plugin has access to the Webpack
   * compiler during development.
   */
  await server.register({
    options: {
      isEnvDevelopment,
      rendererOptions: {
        bodyClass: 'mdc-typography',
      },
    },
    plugin: ssr,
  })

  /**
   * Serve built assets when not in development.
   *
   * @todo Use nginx for non-application file serving.
   */
  if (!isEnvDevelopment) {
    server.route(buildFiles)
  }

  return server
}
