import { combineReducers } from 'redux'
import { ThunkAction } from 'redux-thunk'

import { TodosAction, TodosState, reducer as todos } from './todos'

export interface AppState {
  todos: TodosState
}

export type AppAction = TodosAction

export type AppThunkAction<R = any, E = any> = ThunkAction<
  R,
  AppState,
  E,
  AppAction
>

export const rootReducer = combineReducers<AppState, AppAction>({ todos })
