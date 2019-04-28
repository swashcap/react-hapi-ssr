import { Server } from 'hapi'

import { fetchWrapper } from './fetch-wrapper'
import { Todo, TodosService } from '../../server/utils/todos-service'

export type TodosClient = Pick<
  TodosService,
  Exclude<keyof TodosService, 'create'>
> & {
  create(value: Todo): Promise<Todo>
}

export const getTodosClient = (server?: Server): TodosClient => {
  const makeRequest = async (input: RequestInfo, init: RequestInit = {}) => {
    const response = await fetchWrapper(
      input,
      {
        ...init,
        headers: {
          'todos-client-type': 'web',
        },
      },
      server,
    )

    // TODO: Add error logging
    if (!response.ok) {
      throw new Error(
        `Request failed: ${response.status}: ${response.statusText}`,
      )
    }

    return await response.json()
  }

  return {
    create(payload) {
      return makeRequest('/api/todos', {
        body: JSON.stringify(payload),
        method: 'POST',
      })
    },
    delete(key) {
      return makeRequest(`/api/todos/${key}`, {
        method: 'DELETE',
      })
    },
    read(key) {
      return makeRequest(`/api/todos/${key}`)
    },
    readAll() {
      return makeRequest('/api/todos')
    },
    update(key, payload) {
      return makeRequest(`/api/todos/${key}`, {
        body: JSON.stringify(payload),
        method: 'PUT',
      })
    },
  }
}
