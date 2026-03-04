import { configureStore } from '@reduxjs/toolkit'
import tasksReducer from '../features/tasks/slice'
import timelineReducer from '../features/timeline/slice'
import uiReducer from '../features/ui/slice'

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    timeline: timelineReducer,
    ui: uiReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
