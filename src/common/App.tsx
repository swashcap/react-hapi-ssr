import React from 'react'
import { Provider } from 'react-redux'
import { Route, Switch } from 'react-router-dom'

import { routes } from './routes'

import { Home } from './pages/Home'
import { NoMatch } from './pages/NoMatch'
import { AppStore } from '../client/store/configure-store'

export interface AppProps {
  store: AppStore
}

export const App = ({ store }: AppProps) => (
  <Provider store={store}>
    <Switch>
      <Route component={Home} path={routes.home.path} exact />
      <Route component={NoMatch} />
    </Switch>
  </Provider>
)
