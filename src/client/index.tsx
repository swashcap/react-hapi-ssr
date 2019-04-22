import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { render } from 'react-dom'

import { App } from '../common/App'
import { APP_ELEMENT_ID } from '../common/app-element-id'

import './styles.css'

const init = () => {
  const el = document.getElementById(APP_ELEMENT_ID)

  if (el) {
    render(
      <BrowserRouter>
        <App />
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
