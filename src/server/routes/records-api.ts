import { ServerRoute } from 'hapi'
import joi from 'joi'

const recordsApiParamsSchema = () => ({
  id: joi.string(),
})

const recordsApiPayloadSchema = () => ({
  content: joi.string(),
  order: joi.number().min(0),
})

const required = (getSchema: () => Record<string, joi.AnySchema>) => {
  const schema = getSchema()

  for (const [, s] of Object.entries(schema)) {
    s.required()
  }

  return schema
}

export const recordsApi: ServerRoute[] = [
  {
    handler(request, h) {
      if (request.params.id) {
      }
      return h.continue
    },
    method: 'GET',
    options: {
      description: 'Get record(s)',
      tags: ['api'],
      validate: {
        params: recordsApiParamsSchema(),
      },
    },
    path: '/api/record/{id?}',
  },
  {
    handler(request, h) {
      return h.continue
    },
    method: 'POST',
    options: {
      description: 'Create a record',
      tags: ['api'],
      validate: {
        payload: required(recordsApiPayloadSchema),
      },
    },
    path: '/api/record',
  },
  {
    handler(request, h) {
      return h.continue
    },
    method: 'PUT',
    options: {
      description: 'Update a record',
      tags: ['api'],
      validate: {
        params: required(recordsApiParamsSchema),
        payload: required(recordsApiPayloadSchema),
      },
    },
    path: '/api/record/{id}',
  },
  {
    handler(request, h) {
      return h.continue
    },
    method: 'DELETE',
    options: {
      description: 'Delete a record',
      tags: ['api'],
      validate: {
        params: required(recordsApiParamsSchema),
      },
    },
    path: '/api/record/{id}',
  },
]
