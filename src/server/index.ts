import 'loud-rejection/register'
import dotenvSafe from 'dotenv-safe'

dotenvSafe.config()

import { Server } from 'hapi'
import path from 'path'

import { getServer } from './get-server'
import { developmentHotReloader } from './utils/development-hot-reloader'

const init = async () => {
  let server: Server

  if (process.env.NODE_ENV !== 'development') {
    server = await getServer()
    await server.start()
    return server
  }

  ;[server] = await developmentHotReloader({
    getServer: () => require('./get-server').getServer(),
    watchPath: path.join(__dirname, '../**/*.js'),
  })

  return server
}

if (require.main === module) {
  init().then(server => {
    console.log('Server running on', server.info.uri)
  })
}
