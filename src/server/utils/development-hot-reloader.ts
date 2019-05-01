import { Server } from 'hapi'
import chokidar from 'chokidar'
import debouncePromise from 'debounce-promise'
import debug from 'debug'

export interface DevelopmentHotReloaderOptions {
  getServer: () => Promise<Server>
  moduleResetPattern?: RegExp
  watchPath: string | string[]
}

const log = debug('development-hot-reloader')
let watcher: chokidar.FSWatcher | undefined

export const developmentHotReloader = async ({
  getServer,
  moduleResetPattern = /^((?!node_modules).)*\.[j|t]sx?$/,
  watchPath,
}: DevelopmentHotReloaderOptions): Promise<[Server, chokidar.FSWatcher]> => {
  let server = await getServer()

  const onChange = debouncePromise(async () => {
    log('clearing local modules')
    for (const [id] of Object.entries(require.cache)) {
      if (moduleResetPattern.test(id)) {
        delete require.cache[id]
      }
    }

    log('stopping server')
    await server.stop()

    log('creating new server')
    server = await getServer()

    log('initializing server')
    await server.start()
  }, 250)

  if (watcher) {
    return [server, watcher]
  }

  await Promise.all([
    server.start(),
    new Promise(resolve => {
      watcher = chokidar
        .watch(watchPath, {
          awaitWriteFinish: true,
        })
        .on('change', p => {
          log('change', p)
          onChange()
        })
        .on('error', error => {
          log('error', error)
        })
        .on('ready', () => {
          log('ready')
          resolve()
        })
    }),
  ])

  return [server, watcher!]
}
