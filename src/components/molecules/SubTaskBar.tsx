import { Rnd, type DraggableData, type Position, type RndDragEvent } from 'react-rnd'
import { Dropdown } from 'antd'
import { memo } from 'react'
import type { MenuProps } from 'antd'
import type { SubTask } from '../../features/tasks/types'
import type { ResizeHandleDirection, SubTaskPieces } from '../../features/gantt/types'
import {
  BAR_HEIGHT,
  BarTitle,
  SubBarConnector,
  SubBarDragHandle,
  SubBarSegment,
} from '../organisms/AntdGanttTable.styles'

type SubTaskBarProps = {
  task: SubTask
  bar: { left: number; width: number }
  menu: MenuProps
  cellWidth: number
  subTaskPieces: SubTaskPieces
  onDragStop: (event: RndDragEvent, data: DraggableData) => void
  onResizeStop: (
    event: MouseEvent | TouchEvent,
    direction: ResizeHandleDirection,
    ref: HTMLElement,
    delta: { width: number; height: number },
    position: Position,
  ) => void
}

export const SubTaskBar = memo(function SubTaskBar({
  task,
  bar,
  menu,
  cellWidth,
  subTaskPieces,
  onDragStop,
  onResizeStop,
}: SubTaskBarProps) {
  const toPercent = (value: number): string => {
    if (bar.width <= 0) {
      return '0%'
    }

    return `${(value / bar.width) * 100}%`
  }

  return (
    <Rnd
      bounds="parent"
      dragAxis="x"
      dragHandleClassName="subtask-drag-handle"
      dragGrid={[cellWidth, 1]}
      resizeGrid={[cellWidth, 1]}
      enableResizing={{
        left: true,
        right: true,
        top: false,
        bottom: false,
        topLeft: false,
        topRight: false,
        bottomLeft: false,
        bottomRight: false,
      }}
      resizeHandleStyles={{
        left: { width: '10px', cursor: 'ew-resize' },
        right: { width: '10px', cursor: 'ew-resize' },
      }}
      size={{ width: bar.width, height: BAR_HEIGHT }}
      position={{ x: bar.left, y: 5 }}
      onDragStop={onDragStop}
      onResizeStop={onResizeStop}
    >
      <Dropdown menu={menu} trigger={['contextMenu']}>
        <>
          {subTaskPieces.connectors.map((connector, index) => (
            <SubBarConnector
              key={`${task.id}-connector-${index}`}
              $left={toPercent(connector.left)}
              $width={toPercent(connector.width)}
            />
          ))}
          {subTaskPieces.segments.map((segment, index) => (
            <SubBarSegment
              key={`${task.id}-segment-${index}`}
              $left={toPercent(segment.left)}
              $width={toPercent(segment.width)}
            >
              <SubBarDragHandle className="subtask-drag-handle">
                <BarTitle>{task.title}</BarTitle>
              </SubBarDragHandle>
            </SubBarSegment>
          ))}
        </>
      </Dropdown>
    </Rnd>
  )
})
