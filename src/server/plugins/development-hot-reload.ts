import { Plugin } from 'hapi'
import chokidar from 'chokidar'
import debug from 'debug'

const DEFAULT_CLEAR_PATTERN = /^((?!node_modules).)*\.js$/

const log = debug('development-hot-reload')

export interface DevelopmentHotReloadPluginOptions {
  /** Pattern for clearing the `require` cache */
  clearPattern?: RegExp
  /** Path(s) to watch for changes */
  paths: Parameters<typeof chokidar.watch>['0']
}

export const developmentHotReloadPlugin: Plugin<
  DevelopmentHotReloadPluginOptions
> = {
  once: true,
  name: 'development-hot-reload-plugin',
  register(server, { clearPattern = DEFAULT_CLEAR_PATTERN, paths }) {
    const change = async () => {
      log('stopping server')
      await server.stop()
    }

    return new Promise(resolve => {
      const watcher = chokidar
        .watch(paths, {
          awaitWriteFinish: true,
        })
        .on('change', p => {
          log('change', p)
          for (const [id] of Object.entries(require.cache)) {
            if (clearPattern.test(id)) {
              delete require.cache[id]
            }
          }
          change()
        })
        .on('error', error => {
          log('error', error)
        })
        .on('ready', () => {
          log('ready')
          resolve()
        })
    })
  },
}
