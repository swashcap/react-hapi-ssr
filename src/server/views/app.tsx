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

const PARTIALS_PATH = path.join(__dirname, './partials/')

export type RendererOptionFn = (
  request: Request,
) => Promise<intoStream.Input> | intoStream.Input

export type RendererOption = intoStream.Input | RendererOptionFn

export interface RendererOptions {
  afterApp?: RendererOption
  afterFooter?: RendererOption
  afterHeader?: RendererOption
  beforeApp?: RendererOption
  beforeFooter?: RendererOption
  beforeHeader?: RendererOption
  description?: RendererOption
  head?: RendererOption
  title?: RendererOption
}

const unwrap = (request: Request) => (
  rendererOption?: RendererOption,
): Promise<intoStream.Input> | intoStream.Input => {
  if (rendererOption instanceof Function) {
    return rendererOption(request)
  }

  return rendererOption || ''
}

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
  const getInput = unwrap(request)
  const pass = new stream.PassThrough()

  multistream([
    intoStream(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>`),
    intoStream(getInput(options.title)),
    intoStream(`</title>
    <meta name="description" content="`),
    intoStream(getInput(options.description)),
    intoStream(`">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="icon" href="/assets/favicon.ico">
    <link rel="apple-touch-icon" href="/assets/icon.png">
 `),
    intoStream(getInput(options.head)),
    intoStream(`
  </head>
  <body>
`),
    intoStream(getInput(options.beforeHeader)),
    fs.createReadStream(path.join(PARTIALS_PATH, 'header.html')),
    intoStream(getInput(options.afterHeader)),
    intoStream(getInput(options.beforeApp)),
    ReactDOMServer.renderToNodeStream(
      <div id={APP_ELEMENT_ID}>
        <StaticRouter location={request.path}>
          <App />
        </StaticRouter>
      </div>,
    ),
    intoStream(getInput(options.afterApp)),
    intoStream(getInput(options.beforeFooter)),
    fs.createReadStream(path.join(PARTIALS_PATH, 'footer.html')),
    intoStream(getInput(options.afterFooter)),
  ]).pipe(pass)

  return pass
}
