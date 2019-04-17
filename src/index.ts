import dotenvSafe from 'dotenv-safe'

dotenvSafe.config()

import hapi from 'hapi'

const init = async () => {
  const server = new hapi.Server({
    port: process.env.PORT
  })

  await server.start()

  console.log('Server running on', server.info.uri)
}

init()
