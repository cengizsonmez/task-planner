import dayjs from 'dayjs'
import type { SubTaskOverlapParams, TasksState } from './types'

export const isValidMainParent = (state: TasksState, parentId: string): parentId is string => {
  if (!parentId) {
    return false
  }

  const parentTask = state.entities[parentId]
  return Boolean(parentTask) && parentTask.type === 'MAIN'
}

export const ensureSubTaskBucket = (state: TasksState, parentId: string) => {
  if (!state.subIdsByMain[parentId]) {
    state.subIdsByMain[parentId] = []
  }
}

export const isInvalidDateRange = (start: string, end: string): boolean => {
  const startDate = dayjs(start)
  const endDate = dayjs(end)

  if (!startDate.isValid() || !endDate.isValid()) {
    return true
  }

  return startDate.isAfter(endDate, 'day')
}

export const hasSubTaskOverlapInParent = ({
  tasksState,
  parentId,
  start,
  end,
  taskId,
}: SubTaskOverlapParams): boolean => {
  const startDate = dayjs(start)
  const endDate = dayjs(end)

  return (tasksState.subIdsByMain[parentId] ?? []).some((subId) => {
    const task = tasksState.entities[subId]

    if (!task || task.type !== 'SUB' || task.id === taskId) {
      return false
    }

    const taskStart = dayjs(task.start)
    const taskEnd = dayjs(task.end)

    return !startDate.isAfter(taskEnd, 'day') && !taskStart.isAfter(endDate, 'day')
  })
}
