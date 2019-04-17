import React from 'react'
import { Route, Switch } from 'react-router-dom'

const NoMatch = () => <h1>Not found</h1>

export const App = () => (
  <Switch>
    <Route path="/" exact>
      <h1>Hello, world!</h1>
    </Route>
    <Route component={NoMatch} />
  </Switch>
)
