import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { Body1, Headline1 } from '@material/react-typography'

import { routes } from './routes'

const NoMatch = () => <Headline1>Not found</Headline1>

export const App = () => (
  <Switch>
    <Route path={routes.home.path} exact>
      <Headline1>Hello, world!</Headline1>
      <Body1>This is the home page</Body1>
    </Route>
    <Route component={NoMatch} />
  </Switch>
)
