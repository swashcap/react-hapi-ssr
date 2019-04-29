import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { hydrate } from 'react-dom'

import { App } from './components/App'
import { APP_ELEMENT_ID } from '../common/app-element-id'
import { configureStore } from './store/configure-store'

import './styles.css'

const store = configureStore()

const init = () => {
  const el = document.getElementById(APP_ELEMENT_ID)

  if (el) {
    hydrate(
      <BrowserRouter>
        <App store={store} />
      </BrowserRouter>,
      el,
    )
  }
}

// @ts-ignore
if (module.hot) {
  // @ts-ignore
  module.hot.accept()
}

init()
