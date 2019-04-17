import 'loud-rejection/register'
import dotenvSafe from 'dotenv-safe'

dotenvSafe.config()

import React from 'react'
import ReactDOMServer from 'react-dom/server'
import fs from 'fs'
import good from 'good'
import hapi from 'hapi'
import hapiAlive from 'hapi-alive'
import multistream from 'multistream'
import path from 'path'
import intoStream from 'into-stream'
import stream from 'stream'

import { App } from '../common/App'

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

  server.route({
    method: 'GET',
    path: '/',
    handler: () => {
      const pass = new stream.PassThrough()

      multistream([
        fs.createReadStream(path.join(__dirname, 'views/partials/header.html')),
        intoStream('<div id="app">'),
        ReactDOMServer.renderToNodeStream(React.createElement(App)),
        intoStream('</div>'),
        fs.createReadStream(path.join(__dirname, 'views/partials/footer.html')),
      ]).pipe(pass)

      return pass
    },
  })

  await server.start()

  console.log('Server running on', server.info.uri)
}

init()
