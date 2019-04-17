import React from 'react'
import { render } from 'react-dom'

const el = document.getElementById('app')

if (el) {
  render(<h1>Hello, world!</h1>, el)
}
