import React from 'react'
import ReactDOMServer from 'react-dom/server'
import fs from 'fs'
import intoStream from 'into-stream'
import multistream from 'multistream'
import path from 'path'
import stream from 'stream'
import { ServerRoute } from 'hapi'

import { App } from '../../common/App'

const PARTIALS_PATH = path.join(__dirname, '../views/partials/')

export const ssr: ServerRoute = {
  handler() {
    const pass = new stream.PassThrough()

    multistream([
      fs.createReadStream(path.join(PARTIALS_PATH, 'header.html')),
      intoStream('<div id="app">'),
      ReactDOMServer.renderToNodeStream(React.createElement(App)),
      intoStream('</div>'),
      fs.createReadStream(path.join(PARTIALS_PATH, 'footer.html')),
    ]).pipe(pass)

    return pass
  },
  method: 'GET',
  path: '/',
}
