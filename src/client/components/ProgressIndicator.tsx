import React from 'react'
import LinearProgress from '@material/react-linear-progress'

export const ProgressIndicator: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => (
  <div>
    <LinearProgress />
    {children}
  </div>
)
