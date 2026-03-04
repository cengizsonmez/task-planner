import dayjs from 'dayjs'
import type { TableColumnsType } from 'antd'
import type { ReactNode } from 'react'
import type { MainTask, Task, SubTask } from '../tasks/types'
import {
  clampToYear,
  dateToIndex,
  indexToDate,
  isWeekend,
} from '../timeline/utils'
import type {
  IndexSegment,
  ResizeHandleDirection,
  SubTaskPieces,
  TableRow,
} from './types'
import type { TimelineCell, TimelineView } from '../timeline'

// Piksel genişliğini kapladığı timeline hücre sayısına çevirir.
export const getSpanByWidth = (width: number, cellWidth: number): number =>
  Math.max(1, Math.round(width / cellWidth))

// Başlangıç index'ini mevcut aralık için geçerli görünür sınırlar içinde tutar.
export const clampStartIndex = (index: number, cellCount: number, span: number): number => {
  const maxStart = Math.max(0, cellCount - span)
  return Math.max(0, Math.min(index, maxStart))
}

// Grid üzerinde yakalanan aralığı gerçek başlangıç ve bitiş tarihlerine çevirir.
export const resolveRangeFromGrid = (
  startIndex: number,
  span: number,
  view: TimelineView,
  year: number,
): { start: string; end: string } | null => {
  const endIndex = startIndex + span - 1
  const startIso = indexToDate(startIndex, view, year)
  const endIso = indexToDate(endIndex, view, year)

  if (!startIso || !endIso) {
    return null
  }

  const start = clampToYear(startIso, year).startOf('day')
  const endBase = clampToYear(endIso, year)

  if (view === 'DAY') {
    return {
      start: start.format('YYYY-MM-DD'),
      end: endBase.startOf('day').format('YYYY-MM-DD'),
    }
  }

  if (view === 'WEEK') {
    return {
      start: start.startOf('isoWeek').format('YYYY-MM-DD'),
      end: endBase.endOf('isoWeek').format('YYYY-MM-DD'),
    }
  }

  return {
    start: start.startOf('month').format('YYYY-MM-DD'),
    end: endBase.endOf('month').format('YYYY-MM-DD'),
  }
}

// Dayjs nesnesini uygulamanın kullandığı ISO tarih formatına çevirir.
const toIsoDate = (value: dayjs.Dayjs): string => value.startOf('day').format('YYYY-MM-DD')

// Hafta ve ay görünümünde tüm task aralığını aynı miktarda kaydırır.
const shiftSubTaskRangeByView = (
  task: SubTask,
  view: TimelineView,
  delta: number,
): { start: string; end: string } | null => {
  if (view === 'WEEK') {
    return {
      start: toIsoDate(dayjs(task.start).add(delta, 'week')),
      end: toIsoDate(dayjs(task.end).add(delta, 'week')),
    }
  }

  if (view === 'MONTH') {
    return {
      start: toIsoDate(dayjs(task.start).add(delta, 'month')),
      end: toIsoDate(dayjs(task.end).add(delta, 'month')),
    }
  }

  return null
}

// Resize sırasında tek bir tarih sınırını aktif görünüme göre yeniden hesaplar.
const resolveBoundaryByView = ({
  dateIso,
  targetIndex,
  view,
  year,
}: {
  dateIso: string
  targetIndex: number
  view: TimelineView
  year: number
}): string | null => {
  const cellDateIso = indexToDate(targetIndex, view, year)
  const sourceDate = dayjs(dateIso)

  if (!cellDateIso || !sourceDate.isValid()) {
    return null
  }

  const cellDate = dayjs(cellDateIso)

  if (view === 'WEEK') {
    const offset = sourceDate.isoWeekday() - 1
    return toIsoDate(cellDate.startOf('isoWeek').add(offset, 'day'))
  }

  if (view === 'MONTH') {
    const monthStart = cellDate.startOf('month')
    const safeDay = Math.min(sourceDate.date(), monthStart.daysInMonth())
    return toIsoDate(monthStart.date(safeDay))
  }

  return toIsoDate(cellDate)
}

// Drag ve resize etkileşimleri için bir sonraki tarih aralığını hesaplar.
export const resolveNextSubTaskRange = ({
  mode,
  direction,
  nextLeftPx,
  nextWidthPx,
  timelineStepWidth,
  cellCount,
  task,
  view,
  year,
}: {
  mode: 'drag' | 'resize'
  direction?: ResizeHandleDirection
  nextLeftPx: number
  nextWidthPx: number
  timelineStepWidth: number
  cellCount: number
  task: SubTask
  view: TimelineView
  year: number
}): { start: string; end: string } | null => {
  if (mode === 'drag') {
    const span = getSpanByWidth(nextWidthPx, timelineStepWidth)
    const nextStartIndex = clampStartIndex(
      Math.round(nextLeftPx / timelineStepWidth),
      cellCount,
      span,
    )

    if (view === 'DAY') {
      return resolveRangeFromGrid(nextStartIndex, span, view, year)
    }

    const currentStartIndex = dateToIndex(task.start, view, year)
    if (currentStartIndex === null) {
      return null
    }

    return shiftSubTaskRangeByView(task, view, nextStartIndex - currentStartIndex)
  }

  const currentStartIndex = dateToIndex(task.start, view, year)
  const currentEndIndex = dateToIndex(task.end, view, year)

  if (currentStartIndex === null || currentEndIndex === null) {
    return null
  }

  if (direction === 'left') {
    const nextStartIndex = Math.max(
      0,
      Math.min(Math.round(nextLeftPx / timelineStepWidth), currentEndIndex),
    )

    if (view === 'DAY') {
      const span = currentEndIndex - nextStartIndex + 1
      return resolveRangeFromGrid(nextStartIndex, span, view, year)
    }

    const nextStart = resolveBoundaryByView({
      dateIso: task.start,
      targetIndex: nextStartIndex,
      view,
      year,
    })

    return nextStart ? { start: nextStart, end: task.end } : null
  }

  const nextEndIndex = Math.max(
    currentStartIndex,
    Math.min(
      Math.round((nextLeftPx + nextWidthPx - timelineStepWidth) / timelineStepWidth),
      cellCount - 1,
    ),
  )

  if (view === 'DAY') {
    const span = nextEndIndex - currentStartIndex + 1
    return resolveRangeFromGrid(currentStartIndex, span, view, year)
  }

  const nextEnd = resolveBoundaryByView({
    dateIso: task.end,
    targetIndex: nextEndIndex,
    view,
    year,
  })

  return nextEnd ? { start: task.start, end: nextEnd } : null
}

// Başlangıç tarihini tablo hücresinde gösterilecek formata çevirir.
export const formatStart = (start: string | null): string =>
  start ? dayjs(start).format('DD-MM-YYYY') : '-'

// İki tarih arasındaki dahil süreyi gün cinsinden döndürür.
export const durationDays = (start: string | null, end: string | null): string => {
  if (!start || !end) {
    return '-'
  }

  return String(dayjs(end).diff(dayjs(start), 'day') + 1)
}

// Gün görünümünde tarih aralığını yalnızca hafta içi segmentleri olarak döndürür.
export const getWeekdayIndexSegments = (
  startIso: string,
  endIso: string,
  year: number,
): IndexSegment[] => {
  let start = dayjs(startIso).startOf('day')
  let end = dayjs(endIso).startOf('day')

  if (!start.isValid() || !end.isValid()) {
    return []
  }

  if (start.isAfter(end, 'day')) {
    const temp = start
    start = end
    end = temp
  }

  const rawSegments: IndexSegment[] = []
  let currentStartIndex: number | null = null
  let previousIndex: number | null = null

  let cursor = start
  while (!cursor.isAfter(end, 'day')) {
    const cursorIso = cursor.format('YYYY-MM-DD')
    const index = dateToIndex(cursorIso, 'DAY', year)

    if (index !== null && !isWeekend(cursorIso)) {
      if (currentStartIndex === null) {
        currentStartIndex = index
      }
      previousIndex = index
    } else if (currentStartIndex !== null && previousIndex !== null) {
      rawSegments.push({ startIndex: currentStartIndex, endIndex: previousIndex })
      currentStartIndex = null
      previousIndex = null
    }

    cursor = cursor.add(1, 'day')
  }

  if (currentStartIndex !== null && previousIndex !== null) {
    rawSegments.push({ startIndex: currentStartIndex, endIndex: previousIndex })
  }

  return rawSegments
}

// Task bar'ı hafta içi segmentlere ve hafta sonu bağlayıcı boşluklarına böler.
export const getSubTaskPieces = ({
  startIso,
  endIso,
  barLeft,
  barWidth,
  year,
  stepWidth,
  view,
  dayIndexSegments,
}: {
  startIso: string
  endIso: string
  barLeft: number
  barWidth: number
  year: number
  stepWidth: number
  view: TimelineView
  dayIndexSegments?: IndexSegment[]
}): SubTaskPieces => {
  if (barWidth <= 0) {
    return { segments: [], connectors: [] }
  }

  if (view !== 'DAY') {
    return {
      segments: [{ left: 0, width: barWidth }],
      connectors: [],
    }
  }

  const rawSegments = dayIndexSegments ?? getWeekdayIndexSegments(startIso, endIso, year)

  const segments = rawSegments
    .map((segment) => {
      const absoluteLeft = segment.startIndex * stepWidth
      const absoluteWidth = (segment.endIndex - segment.startIndex + 1) * stepWidth

      const localLeft = absoluteLeft - barLeft
      const localRight = localLeft + absoluteWidth

      const clippedLeft = Math.max(0, localLeft)
      const clippedRight = Math.min(barWidth, localRight)
      const clippedWidth = clippedRight - clippedLeft

      if (clippedWidth <= 0) {
        return null
      }

      return {
        left: clippedLeft,
        width: clippedWidth,
      }
    })
    .filter((item): item is { left: number; width: number } => Boolean(item))

  const connectors = segments
    .slice(0, -1)
    .map((segment, index) => {
      const next = segments[index + 1]
      const left = segment.left + segment.width
      const width = next.left - left

      if (width <= 0) {
        return null
      }

      return { left, width }
    })
    .filter((item): item is { left: number; width: number } => Boolean(item))

  return { segments, connectors }
}

// Sub task'lardan main task için türetilmiş başlangıç-bitiş aralığını çıkarır.
const getMainRange = (subTasks: SubTask[]): { start: string; end: string } | null => {
  if (subTasks.length === 0) {
    return null
  }

  const start = subTasks.reduce((min, task) =>
    dayjs(task.start).isBefore(dayjs(min.start)) ? task : min,
  ).start
  const end = subTasks.reduce((max, task) =>
    dayjs(task.end).isAfter(dayjs(max.end)) ? task : max,
  ).end

  return { start, end }
}

// Verilen main task id'sine ait sub task listesini döndürür.
const getSubTasks = (
  mainId: string,
  entities: Record<string, Task>,
  subIdsByMain: Record<string, string[]>,
): SubTask[] => {
  const subIds = subIdsByMain[mainId] ?? []
  return subIds
    .map((id) => entities[id])
    .filter((task): task is SubTask => Boolean(task) && task.type === 'SUB')
}

// Tablo render'ının kullandığı düz satır yapısını oluşturur.
export const buildTableRows = ({
  mainTasks,
  entities,
  subIdsByMain,
  collapsedMainIds,
}: {
  mainTasks: MainTask[]
  entities: Record<string, Task>
  subIdsByMain: Record<string, string[]>
  collapsedMainIds: Record<string, boolean>
}): TableRow[] => {
  const result: TableRow[] = []

  mainTasks.forEach((mainTask) => {
    const subTasks = getSubTasks(mainTask.id, entities, subIdsByMain)
    const mainRange = getMainRange(subTasks)
    const isCollapsed = Boolean(collapsedMainIds[mainTask.id])

    result.push({
      key: `main-${mainTask.id}`,
      kind: 'MAIN',
      task: mainTask,
      range: mainRange,
      isCollapsed,
    })

    if (!isCollapsed) {
      subTasks.forEach((subTask) => {
        result.push({
          key: `sub-${subTask.id}`,
          kind: 'SUB',
          task: subTask,
          range: { start: subTask.start, end: subTask.end },
          parentId: mainTask.id,
          siblings: subTasks,
        })
      })
    }
  })

  return result
}

// Gün görünümünde sub task'lar için görünür hafta içi segmentlerini önceden hesaplar.
export const buildWeekdaySegmentsMap = (
  rows: TableRow[],
  view: TimelineView,
  year: number,
): Map<string, IndexSegment[]> => {
  if (view !== 'DAY') {
    return new Map<string, IndexSegment[]>()
  }

  const map = new Map<string, IndexSegment[]>()

  rows.forEach((row) => {
    if (row.kind === 'SUB' && row.task.type === 'SUB') {
      map.set(row.task.id, getWeekdayIndexSegments(row.task.start, row.task.end, year))
    }
  })

  return map
}

// Hangi gün kolonlarının hafta sonu stili kullanacağını işaretler.
export const buildWeekendIndexSet = (cells: TimelineCell[], view: TimelineView): Set<number> => {
  console.log('buildWeekendIndexSet called with view:', view) // Debug log
  if (view !== 'DAY') {
    return new Set<number>()
  }

  return new Set(cells.filter((cell) => isWeekend(cell.date)).map((cell) => cell.index))
}

type TimelineLeafColumn = TableColumnsType<TableRow>[number] & { monthLabel?: string }

// Gün görünümünde gruplanmış ay başlıkları dahil dinamik timeline kolonlarını oluşturur.
export const buildTimelineColumns = ({
  cells,
  view,
  cellWidth,
  weekendIndexSet,
  renderTimelineCell,
}: {
  cells: TimelineCell[]
  view: TimelineView
  cellWidth: number
  weekendIndexSet: Set<number>
  renderTimelineCell: (row: TableRow) => ReactNode
}): TableColumnsType<TableRow> => {
  const isDay = view === 'DAY'
  const anchorCellProps = { className: 'timeline-anchor-cell' }

  const leafColumns: TimelineLeafColumn[] = cells.map((cell, index) => ({
    title: isDay ? dayjs(cell.date).format('DD') : cell.label,
    monthLabel: isDay ? dayjs(cell.date).format('MMMM YYYY') : undefined,
    dataIndex: `tl-${index}`,
    key: `tl-${index}`,
    width: cellWidth,
    className: isDay && weekendIndexSet.has(index) ? 'weekend-column' : undefined,
    onCell: index === 0 ? () => anchorCellProps : undefined,
    render: (_value: unknown, record: TableRow) => (index === 0 ? renderTimelineCell(record) : null),
  }))

  if (!isDay) {
    return leafColumns
  }

  const groups: Array<{ label: string; columns: TableColumnsType<TableRow>; from: number }> = []

  leafColumns.forEach((column, index) => {
    const label = column.monthLabel ?? ''
    const prev = groups[groups.length - 1]

    if (prev && prev.label === label) {
      prev.columns.push(column)
      return
    }

    groups.push({ label, columns: [column], from: index })
  })

  return groups.map((group) => ({
    title: group.label || ' ',
    key: `month-${group.label || 'gap'}-${group.from}`,
    children: group.columns,
  }))
}
