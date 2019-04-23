import { Plugin } from 'hapi'
import debug from 'debug'
import webpack from 'webpack'
import webpackDevMiddleware, { Options } from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'

const devLog = debug('webpack-dev-middleware')
const hotLog = debug('webpack-hot-middleware')

export interface DevelopmentWebpackPluginOptions {
  webpackConfig: webpack.Configuration
}

const logger = ({
  error: console.error,
  info: devLog,
  log: devLog,
  trace: devLog,
  warn: devLog,
} as unknown) as Options['logger']

/**
 * Based on hapi-webpack-plugin, this will serve webpack development outputs
 * and webpack hot patches.
 *
 * @todo Use `server.log`
 *
 * {@link https://github.com/SimonDegraeve/hapi-webpack-plugin }
 */
export const developmentWebpackPlugin: Plugin<
  DevelopmentWebpackPluginOptions
> = {
  once: true,
  name: 'developmentWebpackPlugin',
  register(server, { webpackConfig }) {
    const compiler = webpack(webpackConfig)
    const devMiddleware = webpackDevMiddleware(compiler, {
      logger,
      publicPath: (webpackConfig as any).devServer.publicPath,

      /**
       * webpack-dev-middleware mutates `res.locals` with `webpack.Stats` for
       * last compilation result. This blocks the middleware, but makes it =
       * possible to get all of the entrypoint names dynamically.
       *
       * @todo Look into `webpack.Compiler.hooks` for a non-blocking solution
       *
       * {@link https://github.com/webpack/webpack-dev-middleware#server-side-rendering}
       */
      serverSideRender: true,
    })
    const hotMiddleware = webpackHotMiddleware(compiler, {
      log: hotLog,
    })

    server.expose('compiler', compiler)

    server.ext({
      method: async ({ raw: { req, res } }, h) => {
        await Promise.all([
          new Promise((resolve, reject) => {
            devMiddleware(req, res, error => {
              if (error) {
                reject(error)
              } else {
                resolve()
              }
            })
          }),
          new Promise((resolve, reject) => {
            hotMiddleware(req, res, error => {
              if (error) {
                reject(error)
              } else {
                resolve()
              }
            })
          }),
        ])

        /**
         * Middleware calls `res.end()` when it handles to the request. Tell
         * hapi to close the listener.
         *
         * @todo Make hapi log 200s
         */
        if (res.finished) {
          return h.close
        }

        return h.continue
      },
      type: 'onRequest',
    })
  },
}
