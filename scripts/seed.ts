import 'loud-rejection/register'

import uuidv4 from 'uuid/v4'

import { DEFAULT_PATH } from '../src/server/plugins/todos-service'
import { getTodosService } from '../src/server/utils/todos-service'
;(async () => {
  debugger
  const todosService = await getTodosService(DEFAULT_PATH)
  debugger
  const todos = await todosService.readAll()

  if (Object.keys(todos).length) {
    console.log('Todos service already has data')
    return
  }

  await Promise.all(
    [
      {
        description: 'Water the dog',
        isComplete: true,
      },
      {
        description: 'Feed the trash',
        isComplete: false,
      },
      {
        description: 'Take out the flowers',
        isComplete: false,
      },
    ].map(todo => todosService.create(uuidv4(), todo)),
  )

  console.log('Todos service seeded')
})()
