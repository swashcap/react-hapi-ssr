import React from 'react'
import { connect } from 'react-redux'
import { Headline1 } from '@material/react-typography'
import List from '@material/react-list'

import { Page } from './Page'
import { ProgressIndicator } from './ProgressIndicator'
import { AppState } from '../reducers'
import { AppDispatchProp } from '../store/configure-store'
import { fetchTodos } from '../reducers/todos'
import { ErrorMessage } from './ErrorMessage'
import { Todo } from './Todo'

export const Home = connect(state => state)(
  class extends React.Component<AppDispatchProp & AppState> {
    componentWillMount() {
      this.props.dispatch(fetchTodos())
    }

    render() {
      const {
        todos: { items, ui },
      } = this.props
      let content

      if (!ui.fetched) {
        content = <ProgressIndicator>Loading todos…</ProgressIndicator>
      } else if (ui.fetched && ui.error) {
        content = (
          <ErrorMessage title="Failed to load todos">
            {ui.error.message}
          </ErrorMessage>
        )
      } else {
        content = (
          <div>
            <Headline1>Todos</Headline1>
            <List>
              {Object.keys(items).map(id => (
                <Todo key={id} todo={items[id]} />
              ))}
            </List>
          </div>
        )
      }

      return <Page>{content}</Page>
    }
  },
)
