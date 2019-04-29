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
import { configureStore } from '../../client/store/configure-store'

const PARTIALS_PATH = path.join(__dirname, './partials/')

export type RendererOptionFn = (
  request: Request,
) => Promise<intoStream.Input> | intoStream.Input

export type RendererOption = intoStream.Input | RendererOptionFn

export interface RendererOptions {
  afterApp?: RendererOption
  afterFooter?: RendererOption
  afterHeader?: RendererOption
  bodyClass?: RendererOption
  beforeApp?: RendererOption
  beforeFooter?: RendererOption
  beforeHeader?: RendererOption
  description?: RendererOption
  head?: RendererOption
  title?: RendererOption
}

const unwrap = (request: Request) => (
  rendererOption?: RendererOption,
): ReturnType<typeof intoStream> =>
  intoStream(
    rendererOption instanceof Function
      ? rendererOption(request)
      : rendererOption || '',
  )

export const renderScript = (src: string) => `<script src="${src}"></script>\n`

export const renderStylesheet = (href: string) =>
  `<link href="${href}" rel="stylesheet" />\n`

export const render = ({
  options = {},
  request,
}: {
  options?: RendererOptions
  request: Request
}) => {
  const getStream = unwrap(request)
  const pass = new stream.PassThrough()
  const pieces: multistream.Streams = [
    intoStream(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>`),
    getStream(options.title),
    intoStream(`</title>
    <meta name="description" content="`),
    getStream(options.description),
    intoStream(`">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" href="/assets/favicon.ico">
    <link rel="apple-touch-icon" href="/assets/icon.png">`),
  ]

  if (options.head) {
    pieces.push(getStream(options.head))
  }

  pieces.push(
    intoStream(`
  </head>
  <body`),
  )

  if (options.bodyClass) {
    pieces.push(
      intoStream(' class="'),
      getStream(options.bodyClass),
      intoStream('"'),
    )
  }

  pieces.push(intoStream('>\n'))

  if (options.beforeHeader) {
    pieces.push(getStream(options.beforeHeader))
  }

  pieces.push(fs.createReadStream(path.join(PARTIALS_PATH, 'header.html')))

  if (options.afterHeader) {
    pieces.push(getStream(options.afterHeader))
  }

  if (options.beforeApp) {
    pieces.push(getStream(options.beforeApp))
  }

  pieces.push(
    ReactDOMServer.renderToNodeStream(
      <div id={APP_ELEMENT_ID}>
        <StaticRouter location={request.path}>
          <App store={configureStore()} />
        </StaticRouter>
      </div>,
    ),
  )

  if (options.afterApp) {
    pieces.push(getStream(options.afterApp))
  }

  if (options.beforeFooter) {
    pieces.push(getStream(options.beforeFooter))
  }

  pieces.push(fs.createReadStream(path.join(PARTIALS_PATH, 'footer.html')))

  if (options.afterFooter) {
    pieces.push(getStream(options.afterFooter))
  }

  pieces.push(
    intoStream(`
  </body>
</html>`),
  )

  multistream(pieces).pipe(pass)

  return pass
}
