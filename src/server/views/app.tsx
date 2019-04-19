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

export interface RendererOptions {
  afterApp?: intoStream.Input
  beforeApp?: intoStream.Input
}

export const getRenderer = (props: RendererOptions = {}) => (
  request: Request,
) => {
  const { afterApp, beforeApp } = props
  const pass = new stream.PassThrough()

  multistream([
    fs.createReadStream(path.join(PARTIALS_PATH, 'header.html')),
    intoStream(beforeApp || ''),
    ReactDOMServer.renderToNodeStream(
      <div id={APP_ELEMENT_ID}>
        <StaticRouter location={request.path}>
          <App />
        </StaticRouter>
      </div>,
    ),
    intoStream(afterApp || ''),
    fs.createReadStream(path.join(PARTIALS_PATH, 'footer.html')),
  ]).pipe(pass)

  return pass
}
