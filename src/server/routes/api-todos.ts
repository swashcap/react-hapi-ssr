import { ServerRoute } from 'hapi'
import boom from 'boom'
import joi from 'joi'
import uuidv4 from 'uuid/v4'

import { TodoNotFoundError, TodosDatabase, Todo } from '../utils/todos-db'

const BASE_PATH = '/api/todos'

const validateHeaders = joi
  .object({
    'todos-client-type': joi
      .string()
      .valid('android', 'ios', 'web')
      .required(),
  })
  .unknown()

const validatePayload: Record<keyof Todo, joi.AnySchema> = {
  description: joi
    .string()
    .min(2)
    .required(),
  isComplete: joi.boolean().required(),
}

export const apiTodosRoutes: ServerRoute[] = [
  {
    async handler({ params, server: { plugins } }) {
      const todosDatabase = (plugins as any).todosDBPlugin.db as TodosDatabase

      if (params.id) {
        try {
          return await todosDatabase.read(params.id)
        } catch (error) {
          throw error instanceof TodoNotFoundError
            ? boom.notFound('Todo not found', error)
            : error
        }
      }

      return todosDatabase.readAll()
    },
    method: 'GET',
    options: {
      description: 'Get todo(s)',
      tags: ['api', 'todos'],
      validate: {
        headers: validateHeaders,
        params: {
          id: joi.string().guid({
            version: ['uuidv4'],
          }),
        },
      },
    },
    path: `${BASE_PATH}/{id?}`,
  },
  {
    handler({ payload, server: { plugins } }) {
      const todosDatabase = (plugins as any).todosDBPlugin.db as TodosDatabase

      return todosDatabase.create(uuidv4(), payload as Todo)
    },
    method: 'POST',
    options: {
      description: 'Create a todo',
      tags: ['api', 'todos'],
      validate: {
        headers: validateHeaders,
        payload: validatePayload,
      },
    },
    path: BASE_PATH,
  },
  {
    async handler({ params: { id }, payload, server: { plugins } }) {
      const todosDatabase = (plugins as any).todosDBPlugin.db as TodosDatabase

      try {
        return await todosDatabase.update(id, payload as Todo)
      } catch (error) {
        throw error instanceof TodoNotFoundError
          ? boom.badData('Todo not found', error)
          : error
      }
    },
    method: 'PUT',
    options: {
      description: 'Update a todo',
      tags: ['api', 'todos'],
      validate: {
        headers: validateHeaders,
        params: {
          id: joi
            .string()
            .guid({
              version: ['uuidv4'],
            })
            .required(),
        },
        payload: validatePayload,
      },
    },
    path: `${BASE_PATH}/{id}`,
  },
  {
    async handler({ params: { id }, server: { plugins } }) {
      const todosDatabase = (plugins as any).todosDBPlugin.db as TodosDatabase

      try {
        return await todosDatabase.delete(id)
      } catch (error) {
        throw error instanceof TodoNotFoundError
          ? boom.badRequest('Todo not found', error)
          : error
      }
    },
    method: 'DELETE',
    options: {
      description: 'Delete a todo',
      tags: ['api', 'todos'],
      validate: {
        headers: validateHeaders,
        params: {
          id: joi
            .string()
            .guid({
              version: ['uuidv4'],
            })
            .required(),
        },
      },
    },
    path: `${BASE_PATH}/{id}`,
  },
]
