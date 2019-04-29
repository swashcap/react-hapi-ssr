import { Reducer } from 'redux'

export interface AppState {}

const initialState: AppState = {}

export const rootReducer: Reducer<AppState> = (s = initialState) => s
