import React from 'react'
import ReactDOMServer from 'react-dom/server'
import fs from 'fs'
import intoStream from 'into-stream'
import multistream from 'multistream'
import path from 'path'
import stream from 'stream'
import { Request } from 'hapi'
import { StaticRouter } from 'react-router-dom'

import { App } from '../../common/App'
import { APP_ELEMENT_ID } from '../../common/app-element-id'

const webpackConfig = require('../../../webpack.config')

const PARTIALS_PATH = path.join(__dirname, './partials/')

export const render = (request: Request) => {
  const pass = new stream.PassThrough()

  multistream([
    fs.createReadStream(path.join(PARTIALS_PATH, 'header.html')),
    intoStream(`<div id="${APP_ELEMENT_ID}">`),
    ReactDOMServer.renderToNodeStream(
      <StaticRouter location={request.path}>
        <App />
      </StaticRouter>,
    ),
    intoStream('</div>'),
    intoStream(
      `<script src="${
        process.env.NODE_ENV === 'production'
          ? webpackConfig.output.publicPath
          : `//localhost:${process.env.PORT}/`
      }main.bundle.js"></script>`,
    ),
    fs.createReadStream(path.join(PARTIALS_PATH, 'footer.html')),
  ]).pipe(pass)

  return pass
}
