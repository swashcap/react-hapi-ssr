import { ServerRoute } from 'hapi'
import boom from 'boom'
import joi from 'joi'
import uuidv4 from 'uuid/v4'

import {
  AppRecordNotFoundError,
  AppRecordDatabase,
  AppRecord,
} from '../utils/records-db'

const BASE_PATH = '/api/record'

export const recordsApi: ServerRoute[] = [
  {
    async handler({ params, server: { plugins } }) {
      const recordsDb = (plugins as any).recordsDBPlugin.db as AppRecordDatabase

      if (params.id) {
        try {
          return await recordsDb.read(params.id)
        } catch (error) {
          throw error instanceof AppRecordNotFoundError
            ? boom.notFound('Record not found', error)
            : error
        }
      }

      return recordsDb.readAll()
    },
    method: 'GET',
    options: {
      description: 'Get record(s)',
      tags: ['api'],
      validate: {
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
      const recordsDb = (plugins as any).recordsDBPlugin.db as AppRecordDatabase

      const appRecord = payload as AppRecord

      return recordsDb.create(uuidv4(), appRecord)
    },
    method: 'POST',
    options: {
      description: 'Create a record',
      tags: ['api'],
      validate: {
        payload: {
          content: joi.string().required(),
          order: joi
            .number()
            .min(0)
            .required(),
        },
      },
    },
    path: BASE_PATH,
  },
  {
    async handler({ params: { id }, payload, server: { plugins } }) {
      const recordsDb = (plugins as any).recordsDBPlugin.db as AppRecordDatabase

      const appRecord = payload as AppRecord

      try {
        return await recordsDb.update(id, appRecord)
      } catch (error) {
        throw error instanceof AppRecordNotFoundError
          ? boom.badData('Record not found', error)
          : error
      }
    },
    method: 'PUT',
    options: {
      description: 'Update a record',
      tags: ['api'],
      validate: {
        params: {
          id: joi
            .string()
            .guid({
              version: ['uuidv4'],
            })
            .required(),
        },
        payload: {
          content: joi.string().required(),
          order: joi
            .number()
            .min(0)
            .required(),
        },
      },
    },
    path: `${BASE_PATH}/{id}`,
  },
  {
    async handler({ params: { id }, server: { plugins } }) {
      const recordsDb = (plugins as any).recordsDBPlugin.db as AppRecordDatabase

      try {
        return await recordsDb.delete(id)
      } catch (error) {
        throw error instanceof AppRecordNotFoundError
          ? boom.badRequest('Record not found', error)
          : error
      }
    },
    method: 'DELETE',
    options: {
      description: 'Delete a record',
      tags: ['api'],
      validate: {
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
