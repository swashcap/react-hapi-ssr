import { Dispatch, Store, applyMiddleware, createStore } from 'redux'
import isNode from 'detect-node'
import thunk, { ThunkDispatch } from 'redux-thunk'

import { AppAction, AppState, rootReducer } from '../reducers'

export type AppStore = Store<AppState, AppAction>
// export type AppDispatch = Dispatch<AppAction> | ThunkDispatch<AppState, undefined, AppAction>
export type AppDispatch = ThunkDispatch<AppState, undefined, AppAction>
export interface AppDispatchProp {
  dispatch: AppDispatch
}

export const configureStore = (preloadedState?: AppState) => {
  let store: AppStore

  if (process.env.NODE_ENV === 'production' || isNode) {
    store = createStore(rootReducer, preloadedState, applyMiddleware(thunk))
  } else {
    store = createStore(
      rootReducer,
      preloadedState,
      applyMiddleware(thunk, require('redux-logger').default),
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
