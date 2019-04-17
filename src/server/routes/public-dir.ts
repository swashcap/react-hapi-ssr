import { ServerRoute } from 'hapi'

/**
 * Configuration for serving the `public` directory as a top-level `/assets/`
 * with inert.
 *
 * {@link https://github.com/hapijs/inert}
 */
export const publicDir: ServerRoute = {
  handler: {
    directory: {
      index: false,
      path: '.',
      redirectToSlash: true,
    },
  },
  method: 'GET',
  path: '/assets/{param*}',
}
