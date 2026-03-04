import { PlusOutlined } from '@ant-design/icons'
import { Button, Modal, Table, message } from 'antd'
import type { MenuProps, TableColumnsType } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { SortableHeader } from '../atoms/SortableHeader'
import { MainTaskBar } from '../molecules/MainTaskBar'
import { SubTaskBar } from '../molecules/SubTaskBar'
import { TaskNameContent } from '../molecules/TaskNameContent'
import { deleteTask, updateTaskDates } from '../../features/tasks/slice'
import type { MainTask, SubTask } from '../../features/tasks/types'
import {
  getCellWidth,
  isWeekend,
  rangeToPixels,
} from '../../features/timeline/utils'
import { openDrawer, setSort } from '../../features/ui/slice'
import {
  ACTION_COL_WIDTH,
  DURATION_COL_WIDTH,
  NAME_COL_WIDTH,
  START_COL_WIDTH,
} from '../../features/gantt/constants'
import {
  buildTableRows,
  buildTimelineColumns,
  buildWeekdaySegmentsMap,
  buildWeekendIndexSet,
  durationDays,
  formatStart,
  getSubTaskPieces,
  resolveNextSubTaskRange,
} from '../../features/gantt/helpers'
import { TableWrapper, TimelineTrack } from './AntdGanttTable.styles'
import type {
  AntdGanttTableProps,
  ResizeHandleDirection,
  TableRow,
} from '../../features/gantt/types'
import { hasSubTaskOverlapInParent } from '../../features/tasks'

// Görev tablosu ile timeline grid alanını birlikte render eder.
export function AntdGanttTable({ year, view, cells, mainTasks }: AntdGanttTableProps) {
  const dispatch = useAppDispatch()
  const tasksState = useAppSelector((state) => state.tasks)
  const sort = useAppSelector((state) => state.ui.sort)

  const [listHeight, setListHeight] = useState(420)
  const [collapsedMainIds, setCollapsedMainIds] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const updateHeight = () => {
      setListHeight(Math.max(260, Math.min(620, window.innerHeight - 330)))
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)

    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  const cellWidth = getCellWidth(view)
  const timelineStepWidth = cellWidth
  const timelineWidth = cells.length * timelineStepWidth

  const weekendIndexSet = useMemo(() => buildWeekendIndexSet(cells, view), [cells, view])

  const rows = useMemo(
    () =>
      buildTableRows({
        mainTasks,
        entities: tasksState.entities,
        subIdsByMain: tasksState.subIdsByMain,
        collapsedMainIds,
      }),
    [collapsedMainIds, mainTasks, tasksState.entities, tasksState.subIdsByMain],
  )

  const weekdaySegmentsBySubTaskId = useMemo(
    () => buildWeekdaySegmentsMap(rows, view, year),
    [rows, view, year],
  )

  const onSubTaskDatesChange = useCallback(
    (payload: { id: string; start: string; end: string }) => {
      dispatch(updateTaskDates(payload))
    },
    [dispatch],
  )

  const handleSort = useCallback(
    (key: 'TITLE' | 'START' | 'DURATION') => {
      if (sort.key === key) {
        dispatch(setSort({ key, dir: sort.dir === 'ASC' ? 'DESC' : 'ASC' }))
        return
      }

      dispatch(setSort({ key, dir: 'ASC' }))
    },
    [dispatch, sort.dir, sort.key],
  )

  const toggleMainCollapse = useCallback((mainId: string) => {
    setCollapsedMainIds((prev) => ({ ...prev, [mainId]: !prev[mainId] }))
  }, [])

  const quickAddSub = useCallback(
    (mainId: string) => {
      dispatch(openDrawer({ mode: 'SUB', presetParentId: mainId }))
    },
    [dispatch],
  )

  const createContextMenu = useCallback(
    (task: MainTask | SubTask): MenuProps => ({
      items: [
        { key: 'add-sub', label: 'Alt Görev Ekle' },
        { key: 'edit', label: 'Görevi Güncelle' },
        { key: 'delete', label: 'Görevi Sil', danger: true },
      ],
      onClick: ({ key }) => {
        if (key === 'add-sub') {
          const parentIdForSub = task.type === 'MAIN' ? task.id : task.parentId
          dispatch(openDrawer({ mode: 'SUB', presetParentId: parentIdForSub }))
          return
        }

        if (key === 'edit') {
          dispatch(
            openDrawer({
              mode: 'EDIT',
              editTaskId: task.id,
              presetParentId: task.type === 'SUB' ? task.parentId : undefined,
            }),
          )
          return
        }

        if (key === 'delete') {
          Modal.confirm({
            title: 'Görevi silmek istiyor musun?',
            content:
              task.type === 'MAIN'
                ? 'Main görev silinirse alt görevleri de silinir.'
                : 'Bu alt görev kalıcı olarak silinir.',
            okText: 'Sil',
            cancelText: 'Vazgeç',
            okButtonProps: { danger: true },
            onOk: () => dispatch(deleteTask({ id: task.id })),
          })
        }
      },
    }),
    [dispatch],
  )

  const renderTimelineCell = useCallback(
    (row: TableRow) => {
      const rowStart = row.range?.start ?? null
      const rowEnd = row.range?.end ?? null
      const bar =
        rowStart && rowEnd ? rangeToPixels(rowStart, rowEnd, view, year, timelineStepWidth) : null

      const handleDragOrResize = (
        nextLeftPx: number,
        nextWidthPx: number,
        task: SubTask,
        mode: 'drag' | 'resize',
        direction?: ResizeHandleDirection,
      ) => {
        const nextRange = resolveNextSubTaskRange({
          mode,
          direction,
          nextLeftPx,
          nextWidthPx,
          timelineStepWidth,
          cellCount: cells.length,
          task,
          view,
          year,
        })

        if (!nextRange) {
          return
        }

        if (view === 'DAY' && (isWeekend(nextRange.start) || isWeekend(nextRange.end))) {
          message.error('Haftasonu gunlerinde islem yapilamaz.')
          return
        }

        const collision = hasSubTaskOverlapInParent({
          tasksState,
          parentId: task.parentId,
          start: nextRange.start,
          end: nextRange.end,
          taskId: task.id,
        })

        if (collision) {
          message.error('Aynı ana görev ait alt görevlerde tarih aralığı çakışması var.')
          return
        }

        onSubTaskDatesChange({
          id: task.id,
          start: nextRange.start,
          end: nextRange.end,
        })
      }

      return (
        <TimelineTrack $totalWidth={timelineWidth}>
          {row.kind === 'MAIN' && row.task.type === 'MAIN' && bar ? (
            <MainTaskBar
              menu={createContextMenu(row.task)}
              title={row.task.title}
              left={bar.left}
              width={bar.width}
            />
          ) : null}

          {row.kind === 'SUB' && row.task.type === 'SUB' && bar ? (
            <SubTaskBar
              task={row.task}
              bar={bar}
              menu={createContextMenu(row.task)}
              cellWidth={timelineStepWidth}
              subTaskPieces={getSubTaskPieces({
                startIso: row.task.start,
                endIso: row.task.end,
                barLeft: bar.left,
                barWidth: bar.width,
                year,
                stepWidth: timelineStepWidth,
                view,
                dayIndexSegments: weekdaySegmentsBySubTaskId.get(row.task.id),
              })}
              onDragStop={(_event, dragData) => {
                handleDragOrResize(dragData.x, bar.width, row.task as SubTask, 'drag')
              }}
              onResizeStop={(_event, direction, ref, _delta, position) => {
                handleDragOrResize(
                  position.x,
                  ref.offsetWidth,
                  row.task as SubTask,
                  'resize',
                  direction,
                )
              }}
            />
          ) : null}
        </TimelineTrack>
      )
    },
    [
      cells.length,
      createContextMenu,
      onSubTaskDatesChange,
      tasksState,
      timelineStepWidth,
      timelineWidth,
      view,
      weekdaySegmentsBySubTaskId,
      year,
    ],
  )

  const timelineColumns = useMemo<TableColumnsType<TableRow>>(
    () =>
      buildTimelineColumns({
        cells,
        view,
        cellWidth,
        weekendIndexSet,
        renderTimelineCell,
      }),
    [cellWidth, cells, renderTimelineCell, view, weekendIndexSet],
  )

  const columns = useMemo<TableColumnsType<TableRow>>(
    () => [
      {
        title: (
          <SortableHeader
            label="Görevler"
            sortKey="TITLE"
            activeKey={sort.key}
            direction={sort.dir}
            onSort={handleSort}
          />
        ),
        dataIndex: 'title',
        key: 'title',
        width: NAME_COL_WIDTH,
        fixed: 'left',
        render: (_value, row) => (
          <TaskNameContent
            title={row.task.title}
            isMain={row.task.type === 'MAIN'}
            isCollapsed={row.isCollapsed}
            onToggle={() => toggleMainCollapse(row.task.id)}
          />
        ),
      },
      {
        title: (
          <SortableHeader
            label="Başlangıç Tarihleri"
            sortKey="START"
            activeKey={sort.key}
            direction={sort.dir}
            onSort={handleSort}
          />
        ),
        dataIndex: 'start',
        key: 'start',
        width: START_COL_WIDTH,
        fixed: 'left',
        render: (_value, row) => formatStart(row.range?.start ?? null),
      },
      {
        title: (
          <SortableHeader
            label="Süre"
            sortKey="DURATION"
            activeKey={sort.key}
            direction={sort.dir}
            onSort={handleSort}
          />
        ),
        dataIndex: 'duration',
        key: 'duration',
        width: DURATION_COL_WIDTH,
        fixed: 'left',
        render: (_value, row) => durationDays(row.range?.start ?? null, row.range?.end ?? null),
      },
      {
        title: '+',
        dataIndex: 'quickAdd',
        key: 'quickAdd',
        width: ACTION_COL_WIDTH,
        fixed: 'left',
        align: 'center',
        render: (_value, row) => (
          <Button
            size="small"
            type="text"
            icon={<PlusOutlined />}
            onClick={() => quickAddSub(row.kind === 'MAIN' ? row.task.id : row.parentId ?? '')}
          />
        ),
      },
      ...timelineColumns,
    ],
    [handleSort, quickAddSub, sort.dir, sort.key, timelineColumns, toggleMainCollapse],
  )
  console.log('render AntdGanttTable', columns)

  return (
    <TableWrapper>
      <Table<TableRow>
        className={`gantt-${view.toLowerCase()}`}
        tableLayout="fixed"
        pagination={false}
        size="small"
        columns={columns}
        dataSource={rows}
        rowKey="key"
        bordered
        scroll={{ x: 'max-content', y: listHeight }}
      />
    </TableWrapper>
  )
}
