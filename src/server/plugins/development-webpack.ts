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
  name: 'development-webpack-plugin',
  register(server, { webpackConfig }) {
    const compiler = webpack(webpackConfig)
    const devMiddleware = webpackDevMiddleware(compiler, {
      logger,
      publicPath: (webpackConfig as any).devServer.publicPath,
    })
    const hotMiddleware = webpackHotMiddleware(compiler, {
      log: hotLog,
    })

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
        return h.continue
      },
      type: 'onRequest',
    })
  },
}
