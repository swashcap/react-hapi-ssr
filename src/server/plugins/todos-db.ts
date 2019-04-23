import { Plugin } from 'hapi'
import os from 'os'
import path from 'path'

import { getTodosDatabase } from '../utils/todos-db'

export interface TodosDBPluginOptions {
  pathToJSON?: string
}

const DEFAULT_PATH = path.join(os.tmpdir(), 'toilet.json')

export const todosDBPlugin: Plugin<TodosDBPluginOptions> = {
  name: 'todosDBPlugin',
  async register(server, { pathToJSON = DEFAULT_PATH }) {
    const todosDatabase = await getTodosDatabase(pathToJSON)
    server.expose('db', todosDatabase)
  },
}
