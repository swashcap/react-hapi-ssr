import { ServerRoute } from 'hapi'

export const routes: Record<string, ServerRoute> = {
  home: {
    method: '*',
    path: '/',
  },
}
