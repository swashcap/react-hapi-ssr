import toilet from 'toiletdb'

export interface AppRecord {
  content: string
  order: number
}

export interface AppRecordDatabase {
  create(key: string, value: AppRecord): Promise<AppRecord>
  delete(key: string): Promise<AppRecord>
  readAll(): Promise<AppRecord[]>
  read(key: string): Promise<AppRecord>
  update(key: string, value: AppRecord): Promise<AppRecord>
}

export class AppRecordNotFoundError extends Error {
  static code = 'ERECORDNOTFOUND'
}

export class AppRecordExistsError extends Error {
  static code = 'ERECORDEXISTS'
}

export const getRecordsDb = async (...args: Parameters<typeof toilet>) => {
  const db = toilet<AppRecord>(...args)

  await db.open()

  const hasKey = async (key: string) => !!(await db.read(key))

  const getValue = async (key: string) => {
    const value = await db.read(key)

    if (!value) {
      throw new AppRecordNotFoundError(`${key} does not exist`)
    }

    return value
  }

  const recordsDb: AppRecordDatabase = {
    async create(key, value) {
      if (await hasKey(key)) {
        throw new AppRecordExistsError(`${key} already exists`)
      }

      await db.write(key, value)

      return await getValue(key)
    },
    async delete(key) {
      const value = await getValue(key)

      await db.delete(key)

      return value
    },
    async readAll() {
      return Object.values(await db.read())
    },
    async read(key) {
      return await getValue(key)
    },
    async update(key: string, value: AppRecord) {
      if (!(await hasKey(key))) {
        throw new AppRecordNotFoundError(`${key} does not exist`)
      }

      await db.write(key, value)

      return value
    },
  }

  return recordsDb
}
