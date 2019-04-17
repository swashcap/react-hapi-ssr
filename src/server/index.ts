import 'loud-rejection/register'
import dotenvSafe from 'dotenv-safe'

dotenvSafe.config()

import good from 'good'
import hapi from 'hapi'
import hapiAlive from 'hapi-alive'
import vision from 'vision'

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

  await Promise.all([hapiAlive, vision].map(plugin => server.register(plugin)))

  await server.start()

  console.log('Server running on', server.info.uri)
}

init()
