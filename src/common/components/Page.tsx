import React from 'react'

export const Page: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={`page${className ? ` ${className}` : ''}`} {...props} />
