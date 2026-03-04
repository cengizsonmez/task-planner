import type { Task, TasksState } from './types'

const tasks: Task[] = [
  {
    id: 'm-1',
    title: 'FE Proje Planlamasi',
    type: 'MAIN',
  },
  {
    id: 's-1-1',
    title: 'Teknoloji Karari Verilmesi',
    start: '2026-04-01',
    end: '2026-04-02',
    type: 'SUB',
    parentId: 'm-1',
  },
  {
    id: 's-1-2',
    title: 'Gerekli Paketlerin Kurulmasi',
    start: '2026-04-06',
    end: '2026-04-07',
    type: 'SUB',
    parentId: 'm-1',
  },
  {
    id: 's-1-3',
    title: 'Katmanlarin Yaratilmasi',
    start: '2026-04-08',
    end: '2026-04-10',
    type: 'SUB',
    parentId: 'm-1',
  },
  {
    id: 's-1-4',
    title: 'Atomic Design UI Lib',
    start: '2026-04-13',
    end: '2026-04-16',
    type: 'SUB',
    parentId: 'm-1',
  },
  {
    id: 'm-2',
    title: 'Deploy Surecleri',
    type: 'MAIN',
  },
  {
    id: 's-2-1',
    title: 'Docker',
    start: '2026-04-06',
    end: '2026-04-08',
    type: 'SUB',
    parentId: 'm-2',
  },
  {
    id: 's-2-2',
    title: 'Devops Config',
    start: '2026-04-09',
    end: '2026-04-16',
    type: 'SUB',
    parentId: 'm-2',
  },
  {
    id: 's-2-3',
    title: 'CI CD Surecleri',
    start: '2026-04-01',
    end: '2026-04-03',
    type: 'SUB',
    parentId: 'm-2',
  },
  {
    id: 'm-3',
    title: 'BE Proje Planlamasi',
    type: 'MAIN',
  },
  {
    id: 's-3-1',
    title: 'Teknoloji Karari Verilmesi',
    start: '2026-04-01',
    end: '2026-04-03',
    type: 'SUB',
    parentId: 'm-3',
  },
  {
    id: 's-3-2',
    title: 'OpenAPI',
    start: '2026-04-08',
    end: '2026-04-10',
    type: 'SUB',
    parentId: 'm-3',
  },
  {
    id: 's-3-3',
    title: 'Nuget Yonetimi',
    start: '2026-04-06',
    end: '2026-04-07',
    type: 'SUB',
    parentId: 'm-3',
  },
  {
    id: 's-3-4',
    title: 'Katman Mimarisi',
    start: '2026-04-13',
    end: '2026-04-16',
    type: 'SUB',
    parentId: 'm-3',
  },
]

export const tasksSeed: TasksState = {
  entities: tasks.reduce<Record<string, Task>>((acc, task) => {
    acc[task.id] = task
    return acc
  }, {}),
  mainIds: tasks.filter((task) => task.type === 'MAIN').map((task) => task.id),
  subIdsByMain: tasks
    .filter((task) => task.type === 'SUB')
    .reduce<Record<string, string[]>>((acc, task) => {
      const parentId = task.parentId

      if (!parentId) {
        return acc
      }

      if (!acc[parentId]) {
        acc[parentId] = []
      }

      acc[parentId].push(task.id)
      return acc
    }, {}),
}
