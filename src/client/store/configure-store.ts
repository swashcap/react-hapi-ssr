import { Store, applyMiddleware, createStore } from 'redux'
import isNode from 'detect-node'
import thunk from 'redux-thunk'

import { AppState, rootReducer } from '../reducers'

export type AppStore = Store<AppState>

export const configureStore = (preloadedState?: AppState) => {
  let store: AppStore

  if (process.env.NODE_ENV === 'production' || isNode) {
    store = createStore(rootReducer, preloadedState, applyMiddleware(thunk))
  } else {
    store = createStore(
      rootReducer,
      preloadedState,
      applyMiddleware(thunk, require('redux-logger')),
    )

    // @ts-ignore
    if (module.hot) {
      // @ts-ignore
      module.hot.accept('../reducers', () => {
        store.replaceReducer(rootReducer)
      })
    }
  }

  return store
}
