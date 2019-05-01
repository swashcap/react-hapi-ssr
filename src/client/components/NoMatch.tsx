import React from 'react'

import { ErrorMessage } from './ErrorMessage'
import { Page } from './Page'

export const NoMatch = () => (
  <Page>
    <ErrorMessage title="Not found" />
  </Page>
)
