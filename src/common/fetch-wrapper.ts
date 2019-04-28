import fetch from 'isomorphic-fetch'
import isNode from 'detect-node'
import { Server, ServerInjectOptions, ServerInjectResponse } from 'hapi'

export const fetchWrapper = async (
  input: RequestInfo,
  init?: RequestInit,
  server?: Server,
): Promise<Response> => {
  if (isNode && server) {
    const response = await server.inject(
      mapRequestOptionsToInjectOptions(input, init),
    )
    return mapInjectResposeToResponse(response)
  }

  return fetch(input, init)
}

export const mapRequestOptionsToInjectOptions = (
  input: RequestInfo,
  init?: RequestInit,
): ServerInjectOptions | string => {
  if (typeof input === 'string') {
    return input
  }

  const injectOptions: ServerInjectOptions = {
    url: input.url,
  }

  if (input.headers) {
    const headers: Record<string, string> = {}

    for (const [name, value] of input.headers) {
      headers[name] = value
    }

    injectOptions.headers = headers
  }
  if (input.method) {
    injectOptions.method = input.method
  }
  if (input.body) {
    injectOptions.payload = input.body
  }

  return injectOptions
}

export const mapInjectResposeToResponse = (
  injectResponse: ServerInjectResponse,
): Response => {
  const headers: HeadersInit = {}

  for (const [name, value] of Object.entries(injectResponse.headers)) {
    // TODO: Ensure this is the correct delimiter
    headers[name] = Array.isArray(value) ? value.join(' ') : value
  }

  const response = new Response(injectResponse.payload, {
    headers,
    status: injectResponse.statusCode,
    statusText: injectResponse.statusMessage,
  })

  return response
}
