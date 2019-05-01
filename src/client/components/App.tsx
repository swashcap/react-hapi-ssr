import React from 'react'
import { Provider } from 'react-redux'
import { Route, Switch } from 'react-router-dom'

import { routes } from '../../common/routes'

import { Header, HeaderSpacer } from './Header'
import { Home } from './Home'
import { NoMatch } from './NoMatch'
import { AppStore } from '../store/configure-store'

export interface AppProps {
  store: AppStore
}

export const App = ({ store }: AppProps) => (
  <Provider store={store}>
    <Header />
    <HeaderSpacer>
      <Switch>
        <Route component={Home} path={routes.home.path} exact />
        <Route component={NoMatch} />
      </Switch>
    </HeaderSpacer>
  </Provider>
)
