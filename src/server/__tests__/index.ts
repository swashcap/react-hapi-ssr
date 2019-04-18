import { getServer } from '../index'

test('server renders', async () => {
  const server = await getServer()
  const response = await server.inject('/')

  expect(response.headers['content-type']).toMatch('text/html')
  expect(response.statusCode).toBe(200)
  expect(response.payload).toBeTruthy()
})

test('health endpoint', async () => {
  const server = await getServer()
  const response = await server.inject('/health')
  expect(response.statusCode).toBe(200)
  expect(response.payload).toBe("I'm healthy!!!")
})
