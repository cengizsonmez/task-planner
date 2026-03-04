import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ThemeMode } from '../../styles/theme'


type DrawerMode = 'MAIN' | 'SUB' | 'EDIT'
type SortKey = 'TITLE' | 'START' | 'DURATION'
type SortDir = 'ASC' | 'DESC'

type UiState = {
  drawer: {
    open: boolean
    mode: DrawerMode
    presetParentId?: string
    editTaskId?: string
  }
  sort: {
    key: SortKey
    dir: SortDir
  }
  theme: ThemeMode
}

const readInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'LIGHT'
  }

  const stored = window.localStorage.getItem('task-planner-theme')
  return stored === 'DARK' ? 'DARK' : 'LIGHT'
}

const initialState: UiState = {
  drawer: {
    open: false,
    mode: 'MAIN',
  },
  sort: {
    key: 'START',
    dir: 'ASC',
  },
  theme: readInitialTheme(),
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openDrawer(
      state,
      action: PayloadAction<{
        mode: DrawerMode
        presetParentId?: string
        editTaskId?: string
      }>,
    ) {
      state.drawer.open = true
      state.drawer.mode = action.payload.mode
      state.drawer.presetParentId = action.payload.presetParentId
      state.drawer.editTaskId = action.payload.editTaskId
    },
    closeDrawer(state) {
      state.drawer.open = false
      state.drawer.presetParentId = undefined
      state.drawer.editTaskId = undefined
    },
    setSort(state, action: PayloadAction<UiState['sort']>) {
      state.sort = action.payload
    },
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload
    },
    toggleTheme(state) {
      state.theme = state.theme === 'LIGHT' ? 'DARK' : 'LIGHT'
    },
  },
})

export const {
  openDrawer,
  closeDrawer,
  setSort,
  setTheme,
  toggleTheme,
} = uiSlice.actions
export default uiSlice.reducer
