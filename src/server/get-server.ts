import good from 'good'
import hapi from 'hapi'
import hapiAlive from 'hapi-alive'
import inert from 'inert'

import { buildFiles, publicFiles } from './routes/static-files'
import { ssr } from './plugins/ssr'

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

  /**
   * Serve built assets when not in development.
   *
   * @todo Use nginx for non-application file serving.
   */
  if (process.env.NODE_ENV !== 'development') {
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

  return server
}
