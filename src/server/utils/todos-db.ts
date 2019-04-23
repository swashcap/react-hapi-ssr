import toilet from 'toiletdb'

export interface Todo {
  description: string
  isComplete: boolean
}

export interface TodosDatabase {
  create(key: string, value: Todo): Promise<Todo>
  delete(key: string): Promise<Todo>
  readAll(): Promise<Record<string, Todo>>
  read(key: string): Promise<Todo>
  update(key: string, value: Todo): Promise<Todo>
}

export class TodoNotFoundError extends Error {
  static code = 'ETODONOTFOUND'
}

export class TodoExistsError extends Error {
  static code = 'ETODOEXISTS'
}

export const getTodosDatabase = async (...args: Parameters<typeof toilet>) => {
  const db = toilet<Todo>(...args)

  await db.open()

  const hasKey = async (key: string) => !!(await db.read(key))

  const getValue = async (key: string) => {
    const value = await db.read(key)

    if (!value) {
      throw new TodoNotFoundError(`${key} does not exist`)
    }

    return value
  }

  const todosDatabase: TodosDatabase = {
    async create(key, value) {
      if (await hasKey(key)) {
        throw new TodoExistsError(`${key} already exists`)
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
      return await db.read()
    },
    async read(key) {
      return await getValue(key)
    },
    async update(key: string, value: Todo) {
      if (!(await hasKey(key))) {
        throw new TodoNotFoundError(`${key} does not exist`)
      }

      await db.write(key, value)

      return value
    },
  }

  return todosDatabase
}
