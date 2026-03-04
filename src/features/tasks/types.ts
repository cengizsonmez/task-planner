export type TaskType = 'MAIN' | 'SUB'

type BaseTask = {
  id: string
  title: string
}

export type MainTask = BaseTask & {
  type: 'MAIN'
}

export type SubTask = BaseTask & {
  start: string
  end: string
  type: 'SUB'
  parentId: string
}

export type Task = MainTask | SubTask

export type TasksState = {
  entities: Record<string, Task>
  mainIds: string[]
  subIdsByMain: Record<string, string[]>
}

export type AddTaskPayload =
  | {
      title: string
      start: string
      end: string
      type: 'MAIN'
    }
  | {
      title: string
      start: string
      end: string
      type: 'SUB'
      parentId: string
    }

export type UpdateTaskDatesPayload = {
  id: string
  start: string
  end: string
}

export type UpdateTaskPayload = {
  id: string
  title: string
  start: string
  end: string
  parentId?: string
}

export type SubTaskOverlapParams = {
  tasksState: TasksState
  parentId: string
  start: string
  end: string
  taskId?: string
}

//TODO: tipler azaltılabilir mi bakılacak