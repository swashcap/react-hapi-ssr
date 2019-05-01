import { Plugin, Server } from 'hapi'
import os from 'os'
import path from 'path'

import { getTodosService, TodosService } from '../utils/todos-service'

export interface TodosDBPluginOptions {
  pathToJSON?: string
}

export const DEFAULT_PATH = path.join(os.tmpdir(), 'toilet.json')
const EXPOSE_KEY = 'service'
const PLUGIN_NAME = 'todosServicePlugin'

export const getService = (server: Server) => {
  return (server.plugins as any)[PLUGIN_NAME][EXPOSE_KEY] as TodosService
}

export const todosServicePlugin: Plugin<TodosDBPluginOptions> = {
  name: PLUGIN_NAME,
  async register(server, { pathToJSON = DEFAULT_PATH }) {
    const todosDatabase = await getTodosService(pathToJSON)
    server.expose(EXPOSE_KEY, todosDatabase)
  },
}
