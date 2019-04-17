import React from 'react'
import { render } from 'react-dom'

import { App } from '../common/App'

const el = document.getElementById('app')

if (el) {
  render(<App />, el)
}
