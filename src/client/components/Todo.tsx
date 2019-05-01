import React from 'react'
import { ListItem, ListItemMeta, ListItemText } from '@material/react-list'

import { Todo as TodoType } from '../../server/utils/todos-service'

export const Todo: React.FC<{
  todo: TodoType
}> = ({ todo: { description, isComplete } }) => (
  <ListItem>
    <ListItemText primaryText={description} />
    <ListItemMeta meta="info" />
  </ListItem>
)
