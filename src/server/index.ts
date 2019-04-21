import 'loud-rejection/register'
import dotenvSafe from 'dotenv-safe'

dotenvSafe.config()

import path from 'path'

import { getServer } from './get-server'
import { developmentHotReloadPlugin } from './plugins/development-hot-reload'
import { developmentWebpackPlugin } from './plugins/development-webpack'

const webpackConfig = require('../../webpack.config')

export const init = async () => {
  const server = await getServer()

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
          getNewServer: async () => {
            // Hacks
            const newServer = await require('./get-server').getServer()
            return newServer
          },
          paths: path.resolve(__dirname, '../**/*.js'),
        },
        plugin: developmentHotReloadPlugin,
      },
    ])
  }

  await server.initialize()

  return server
}

if (require.main === module) {
  init()
    .then(server => Promise.all([server, server.start()]))
    .then(([server]) => {
      console.log('Server running on', server.info.uri)
    })
}
