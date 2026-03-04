import type { MenuProps } from 'antd'
import type { MainTask, SubTask } from '../tasks/types'
import type { TimelineCell, TimelineView } from '../timeline'

export type AntdGanttTableProps = {
  year: number
  view: TimelineView
  cells: TimelineCell[]
  mainTasks: MainTask[]
}

export type TableRow = {
  key: string
  kind: 'MAIN' | 'SUB'
  task: MainTask | SubTask
  range: { start: string; end: string } | null
  parentId?: string
  siblings?: SubTask[]
  isCollapsed?: boolean
}

export type IndexSegment = {
  startIndex: number
  endIndex: number
}

export type SubTaskPieces = {
  segments: Array<{ left: number; width: number }>
  connectors: Array<{ left: number; width: number }>
}

export type MainBarProps = {
  menu: MenuProps
  title: string
  left: number
  width: number
}

export type ResizeHandleDirection =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'topRight'
  | 'bottomRight'
  | 'bottomLeft'
  | 'topLeft'

export type DrawerMode = 'MAIN' | 'SUB' | 'EDIT'


// type SortKey = 'TITLE' | 'START' | 'DURATION'
// type SortDir = 'ASC' | 'DESC'