import { ServerRoute } from 'hapi'
import path from 'path'

/**
 * Routes for serving static files.
 *
 * {@link https://github.com/hapijs/inert}
 */

/**
 * Configuration for serving the `public` directory as a top-level `/assets/`.
 */
export const publicFiles: ServerRoute = {
  handler: {
    directory: {
      index: false,
      path: path.join(__dirname, '../../../public/'),
      redirectToSlash: false,
    },
  },
  method: 'GET',
  path: '/assets/{param*}',
}

/**
 * Configuration for serving the `dist` directory.
 */
export const buildFiles: ServerRoute = {
  handler: {
    directory: {
      index: false,
      path: path.join(__dirname, '../../../dist/'),
      redirectToSlash: false,
    },
  },
  method: 'GET',
  path: '/dist/{param*}',
}
