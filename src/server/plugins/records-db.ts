import { Plugin } from 'hapi'
import os from 'os'
import path from 'path'

import { getRecordsDb } from '../utils/records-db'

export interface RecordsDBPluginOptions {
  pathToJSON?: string
}

const DEFAULT_PATH = path.join(os.tmpdir(), 'toilet.json')

export const recordsDBPlugin: Plugin<RecordsDBPluginOptions> = {
  name: 'recordsDBPlugin',
  async register(server, { pathToJSON = DEFAULT_PATH }) {
    const recordsDb = await getRecordsDb(pathToJSON)
    server.expose('db', recordsDb)
  },
}
