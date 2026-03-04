export type ThemeMode = 'LIGHT' | 'DARK'

export const lightTheme = {
  mode: 'LIGHT' as const,
  colors: {
    background: '#f4f7fb',
    panel: '#ffffff',
    border: '#d9d9d9',
    text: '#1f1f1f',
    subtleText: '#595959',
    gridBackground: '#ffffff',
    gridHeaderBackground: '#ffffff',
    gridLine: '#f0f0f0',
    weekendCellBackground: 'rgba(0, 0, 0, 0.06)',
    mainBarBackground: '#1677ff',
    mainBarText: '#ffffff',
    subBarBackground: '#69b1ff',
    subBarBorder: '#4096ff',
    subBarText: '#0a2f5c',
  },
}

export const darkTheme = {
  mode: 'DARK' as const,
  colors: {
    background: '#101318',
    panel: '#181c23',
    border: '#2a313b',
    text: '#f0f4fa',
    subtleText: '#b3bfce',
    gridBackground: '#151922',
    gridHeaderBackground: '#1c2230',
    gridLine: '#2a313b',
    weekendCellBackground: 'rgba(255, 255, 255, 0.06)',
    mainBarBackground: '#4d9cff',
    mainBarText: '#09101a',
    subBarBackground: '#2f6cb9',
    subBarBorder: '#4385d6',
    subBarText: '#e6f0ff',
  },
}

export type AppTheme = {
  mode: ThemeMode
  colors: typeof lightTheme.colors
}
