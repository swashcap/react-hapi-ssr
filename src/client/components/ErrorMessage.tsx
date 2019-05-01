import React from 'react'
import { Body1, Headline1 } from '@material/react-typography'

export const ErrorMessage: React.FC<{
  children?: React.ReactNode
  title: React.ReactNode
}> = ({ children, title }) => (
  <div>
    <Headline1>{title}</Headline1>
    {!!children && <Body1>{children}</Body1>}
  </div>
)
