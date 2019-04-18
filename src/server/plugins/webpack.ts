import { Plugin } from 'hapi'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'

const webpackConfig = require('../../../webpack.config')

/**
 * {@link https://github.com/SimonDegraeve/hapi-webpack-plugin }
 */
export const webpackPlugin: Plugin<any> = {
  once: true,
  name: 'webpack-plugin',
  register(server) {
    const compiler = webpack({ mode: 'development', ...webpackConfig })
    const devMiddleware = webpackDevMiddleware(compiler)
    const hotMiddleware = webpackHotMiddleware(compiler)

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
