import { Action, Reducer } from 'redux'
import { ThunkAction } from 'redux-thunk'

import { Todo } from '../../server/utils/todos-service'
import { getTodosClient } from '../../common/clients/todos'
import { AppThunkAction } from '.'

const todosClient = getTodosClient()

interface TodosReadAllFailure extends Action<'TODOS_READ_ALL_FAILURE'> {
  error: true
  payload: Error
}

interface TodosReadAllInit extends Action<'TODOS_READ_ALL_INIT'> {
  payload: null
}

interface TodosReadAllSuccess extends Action<'TODOS_READ_ALL_SUCCESS'> {
  payload: Record<string, Todo>
}

export type TodosAction =
  | TodosReadAllFailure
  | TodosReadAllInit
  | TodosReadAllSuccess

export const fetchTodos = (): AppThunkAction => {
  return async dispatch => {
    dispatch({
      payload: null,
      type: 'TODOS_READ_ALL_INIT',
    })

    try {
      const response = await todosClient.readAll()

      dispatch({
        payload: response,
        type: 'TODOS_READ_ALL_SUCCESS',
      })
    } catch (error) {
      dispatch({
        error: true,
        payload: error,
        type: 'TODOS_READ_ALL_FAILURE',
      })
    }
  }
}

export interface TodosState {
  items: Record<string, Todo>
  ui: {
    error?: Error
    fetched: boolean
    loading: boolean
  }
}

const initialState: TodosState = {
  items: {},
  ui: {
    error: undefined,
    fetched: false,
    loading: false,
  },
}

export const reducer: Reducer<TodosState, TodosAction> = (
  state = initialState,
  action,
) => {
  if (action.type === 'TODOS_READ_ALL_FAILURE') {
    return {
      ...state,
      ui: {
        error: action.payload,
        fetched: true,
        loading: false,
      },
    }
  } else if (action.type === 'TODOS_READ_ALL_INIT') {
    return {
      ...state,
      ui: {
        error: undefined,
        fetched: false,
        loading: true,
      },
    }
  } else if (action.type === 'TODOS_READ_ALL_SUCCESS') {
    return {
      items: action.payload,
      ui: {
        error: undefined,
        fetched: true,
        loading: false,
      },
    }
  }

  return state
}
