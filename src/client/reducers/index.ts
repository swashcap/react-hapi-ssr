import { combineReducers } from 'redux'

import { TodosAction, TodosState, reducer as todos } from './todos'

export interface AppState {
  todos: TodosState
}

export type AppAction = TodosAction

export const rootReducer = combineReducers<AppState, AppAction>({ todos })
