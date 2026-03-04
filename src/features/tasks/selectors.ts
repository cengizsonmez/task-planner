import { createSelector } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
import type { RootState } from '../../app/store'
import type { MainTask, SubTask } from './types'

const selectTasksState = (state: RootState) => state.tasks
const selectSort = (state: RootState) => state.ui.sort

// Görünen main task aralığını alt sub task'lardan türetir.
const getMainRange = (
  tasksState: RootState['tasks'],
  mainId: string,
): { start: string; end: string } | null => {
  const subIds = tasksState.subIdsByMain[mainId] ?? []

  const subTasks = subIds
    .map((id) => tasksState.entities[id])
    .filter((task): task is SubTask => Boolean(task) && task.type === 'SUB')

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

const getDurationInDays = (start: string, end: string): number =>
  dayjs(end).diff(dayjs(start), 'day') + 1

const subTasksSelectorCache = new Map<string, (state: RootState) => SubTask[]>()

// Main task'ları aktif UI sıralama ayarına göre döndürür.
export const selectMainTasksSorted = createSelector(
  [selectTasksState, selectSort],
  (tasksState, sort) => {
    const items = tasksState.mainIds
      .map((id) => tasksState.entities[id])
      .filter((task): task is MainTask => Boolean(task) && task.type === 'MAIN')

    const sorted = [...items].sort((a, b) => {
      if (sort.key === 'TITLE') {
        return a.title.localeCompare(b.title, 'tr-TR')
      }

      const rangeA = getMainRange(tasksState, a.id)
      const rangeB = getMainRange(tasksState, b.id)

      if (sort.key === 'START') {
        const startA = rangeA ? dayjs(rangeA.start).valueOf() : Number.POSITIVE_INFINITY
        const startB = rangeB ? dayjs(rangeB.start).valueOf() : Number.POSITIVE_INFINITY

        if (startA === startB) {
          return a.title.localeCompare(b.title, 'tr-TR')
        }

        return startA - startB
      }

      const durationA = rangeA ? getDurationInDays(rangeA.start, rangeA.end) : Number.POSITIVE_INFINITY
      const durationB = rangeB ? getDurationInDays(rangeB.start, rangeB.end) : Number.POSITIVE_INFINITY

      if (durationA === durationB) {
        return a.title.localeCompare(b.title, 'tr-TR')
      }

      return durationA - durationB
    })

    return sort.dir === 'ASC' ? sorted : sorted.reverse()
  },
)

// Tek bir main task için memoize edilmiş sub task selector'ı döndürür.
export const selectSubTasks = (mainId: string) => {
  const cached = subTasksSelectorCache.get(mainId)
  if (cached) {
    return cached
  }

  const selector = createSelector([selectTasksState], (tasksState) => {
    const subIds = tasksState.subIdsByMain[mainId] ?? []

    return subIds
      .map((id) => tasksState.entities[id])
      .filter((task): task is SubTask => Boolean(task) && task.type === 'SUB')
  })

  subTasksSelectorCache.set(mainId, selector)
  return selector
}

// Bir main task için bar aralığını sub task'lardan türeterek döndürür.
export const selectMainBarRange = (mainId: string) =>
  createSelector([selectSubTasks(mainId)], (subTasks) => {
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
  })
