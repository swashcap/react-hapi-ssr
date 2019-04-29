import React from 'react'
import { Body1, Headline1 } from '@material/react-typography'

import { Page } from './Page'

export const Home: React.FC = () => (
  <Page>
    <Headline1>Hello, world!</Headline1>
    <Body1>This is the home page</Body1>
  </Page>
)
