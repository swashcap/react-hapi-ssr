import React from 'react'
import { Route, Switch } from 'react-router-dom'

import { routes } from './routes'

import { Home } from './pages/Home'
import { NoMatch } from './pages/NoMatch'

export const App = () => (
  <Switch>
    <Route component={Home} path={routes.home.path} exact />
    <Route component={NoMatch} />
  </Switch>
)
