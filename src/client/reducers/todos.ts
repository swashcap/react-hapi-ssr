import { Action, Reducer } from 'redux'

export interface TodosState {}

export interface TodosAction extends Action {}

const initialState: TodosState = {}

export const reducer: Reducer<TodosState, TodosAction> = (
  state = initialState,
) => state
