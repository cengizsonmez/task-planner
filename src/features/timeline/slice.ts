import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
import type { TimelineState, TimelineView } from './types'

const initialState: TimelineState = {
  view: 'DAY',
  year: dayjs().year(),
}

const timelineSlice = createSlice({
  name: 'timeline',
  initialState,
  reducers: {
    setTimelineView(state, action: PayloadAction<TimelineView>) {
      state.view = action.payload
    },
    setYear(state, action: PayloadAction<number>) {
      state.year = action.payload
    },
    nextYear(state) {
      state.year += 1
    },
    prevYear(state) {
      state.year -= 1
    },
  },
})

export const { setTimelineView, setYear, nextYear, prevYear } = timelineSlice.actions
export default timelineSlice.reducer
