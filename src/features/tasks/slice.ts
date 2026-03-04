import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import dayjs from 'dayjs'
import { isWeekend } from "./../timeline/utils";
import { tasksSeed } from "./mockSeed";
import type { Task, TasksState } from "./types";
import { hasSubTaskOverlapInParent } from "./helpers";

type AddTaskPayload =
  | {
      title: string
      type: 'MAIN'
    }
  | {
      title: string
      start: string
      end: string
      type: 'SUB'
      parentId: string
    }

type UpdateTaskDatesPayload = {
  id: string
  start: string
  end: string
}

type UpdateTaskPayload = {
  id: string
  title: string
} & (
  | {
      type: 'MAIN'
    }
  | {
      type: 'SUB'
      start: string
      end: string
      parentId?: string
    }
)

const initialState: TasksState = tasksSeed

// Reducer'ları geçersiz veya ters tarih aralıklarına karşı korur.
const isInvalidDateRange = (start: string, end: string): boolean => {
  const startDate = dayjs(start)
  const endDate = dayjs(end)

  if (!startDate.isValid() || !endDate.isValid()) {
    return true
  }

  return startDate.isAfter(endDate, 'day')
}

// Bir SUB task'ın geçerli bir MAIN task'ı referans almasını zorunlu kılar.
const isValidMainParent = (state: TasksState, parentId: string | undefined): parentId is string => {
  if (!parentId) {
    return false
  }

  const parentTask = state.entities[parentId]
  return Boolean(parentTask) && parentTask.type === 'MAIN'
}

// Sub task id'leri eklenmeden önce parent dizisini oluşturur.
const ensureSubTaskBucket = (state: TasksState, parentId: string) => {
  if (!state.subIdsByMain[parentId]) {
    state.subIdsByMain[parentId] = []
  }
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: {
      reducer(state, action: PayloadAction<Task>) {
        const task = action.payload

        if (task.type === 'MAIN') {
          state.entities[task.id] = task
          state.mainIds.push(task.id)
          if (!state.subIdsByMain[task.id]) {
            state.subIdsByMain[task.id] = []
          }
          return
        }

        if (isInvalidDateRange(task.start, task.end)) {
          return
        }

        if (isWeekend(task.start) || isWeekend(task.end)) {
          return
        }

        if (!isValidMainParent(state, task.parentId)) {
          return
        }

        if (
          hasSubTaskOverlapInParent({
            tasksState: state,
            parentId: task.parentId,
            start: task.start,
            end: task.end,
          })
        ) {
          return
        }

        state.entities[task.id] = task

        ensureSubTaskBucket(state, task.parentId)
        state.subIdsByMain[task.parentId].push(task.id)
      },
      prepare(payload: AddTaskPayload) {
        const nextId = nanoid()

        if (payload.type === 'MAIN') {
          return {
            payload: {
              id: nextId,
              title: payload.title,
              type: 'MAIN' as const,
            },
          }
        }

        return {
          payload: {
            id: nextId,
            title: payload.title,
            start: payload.start,
            end: payload.end,
            type: 'SUB' as const,
            parentId: payload.parentId,
          },
        }
      },
    },
    updateTaskDates(state, action: PayloadAction<UpdateTaskDatesPayload>) {
      const { id, start, end } = action.payload
      const task = state.entities[id]

      if (!task) {
        return
      }

      if (isInvalidDateRange(start, end)) {
        return
      }

      if (task.type === 'MAIN') {
        return
      }

      const blocked = hasSubTaskOverlapInParent({
        tasksState: state,
        parentId: task.parentId,
        start,
        end,
        taskId: id,
      })

      if (blocked) {
        return
      }

      task.start = start
      task.end = end
    },
    updateTask(state, action: PayloadAction<UpdateTaskPayload>) {
      const { id, title } = action.payload
      const task = state.entities[id]

      if (!task) {
        return
      }

      if (task.type === 'MAIN') {
        if (action.payload.type !== 'MAIN') {
          return
        }

        task.title = title
        return
      }

      if (action.payload.type !== 'SUB') {
        return
      }

      const { start, end, parentId } = action.payload

      if (isInvalidDateRange(start, end)) {
        return
      }

      if (isWeekend(start) || isWeekend(end)) {
        return
      }

      const targetParentId = parentId ?? task.parentId

      if (!isValidMainParent(state, targetParentId)) {
        return
      }

      const blocked = hasSubTaskOverlapInParent({
        tasksState: state,
        parentId: targetParentId,
        start,
        end,
        taskId: id,
      })

      if (blocked) {
        return
      }

      if (task.parentId !== targetParentId) {
        state.subIdsByMain[task.parentId] = (state.subIdsByMain[task.parentId] ?? []).filter(
          (subId) => subId !== task.id,
        )
        ensureSubTaskBucket(state, targetParentId)
        state.subIdsByMain[targetParentId].push(task.id)
        task.parentId = targetParentId
      }

      task.title = title
      task.start = start
      task.end = end
    },
    deleteTask(state, action: PayloadAction<{ id: string }>) {
      const task = state.entities[action.payload.id]

      if (!task) {
        return
      }

      if (task.type === 'SUB') {
        const parentSubs = state.subIdsByMain[task.parentId] ?? []
        state.subIdsByMain[task.parentId] = parentSubs.filter((subId) => subId !== task.id)
        delete state.entities[task.id]
        return
      }

      const subIds = state.subIdsByMain[task.id] ?? []
      subIds.forEach((subId) => {
        delete state.entities[subId]
      })
      delete state.subIdsByMain[task.id]
      state.mainIds = state.mainIds.filter((mainId) => mainId !== task.id)
      delete state.entities[task.id]
    },
  },
})

export const { addTask, updateTaskDates, updateTask, deleteTask } = tasksSlice.actions
export default tasksSlice.reducer
