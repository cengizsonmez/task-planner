import { Dropdown } from 'antd'
import { memo } from 'react'
import type { MainBarProps } from '../../features/gantt/types'
import { BarTitle, MainBarSurface } from '../organisms/AntdGanttTable.styles'

export const MainTaskBar = memo(function MainTaskBar({ menu, title, left, width }: MainBarProps) {
  return (
    <Dropdown menu={menu} trigger={['contextMenu']}>
      <MainBarSurface style={{ left, width }}>
        <BarTitle>{title}</BarTitle>
      </MainBarSurface>
    </Dropdown>
  )
})
