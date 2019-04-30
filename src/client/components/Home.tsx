import React from 'react'
import { connect } from 'react-redux'
import { Body1, Headline1 } from '@material/react-typography'

import { Page } from './Page'
import { AppState } from '../reducers'
import { AppDispatchProp } from '../store/configure-store'
import { fetchTodos } from '../reducers/todos'

export const Home = connect(state => state)(
  class extends React.Component<AppDispatchProp & AppState> {
    componentWillMount() {
      this.props.dispatch(fetchTodos())
    }

    render() {
      return (
        <Page>
          <Headline1>Hello, world!</Headline1>
          <Body1>This is the home page</Body1>
        </Page>
      )
    }
  },
)
