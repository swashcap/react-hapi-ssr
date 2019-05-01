import React from 'react'
import TopAppBar, {
  TopAppBarIcon,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
  TopAppBarFixedAdjust,
} from '@material/react-top-app-bar'
import MaterialIcon from '@material/react-material-icon'

export const Header: React.FC<{
  onMenuClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void
}> = ({ onMenuClick }) => (
  <TopAppBar fixed>
    <TopAppBarRow>
      <TopAppBarSection align="start">
        <TopAppBarIcon navIcon tabIndex={0}>
          <MaterialIcon hasRipple icon="menu" onClick={onMenuClick} />
        </TopAppBarIcon>
        <TopAppBarTitle>Todos</TopAppBarTitle>
      </TopAppBarSection>
    </TopAppBarRow>
  </TopAppBar>
)

export const HeaderSpacer = TopAppBarFixedAdjust
