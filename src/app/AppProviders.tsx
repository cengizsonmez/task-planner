import { ConfigProvider, theme as antdTheme } from 'antd'
import { useEffect, useMemo, type ReactNode } from 'react'
import { ThemeProvider } from 'styled-components'
import { useAppSelector } from './hooks'
import { GlobalStyle } from '../styles/GlobalStyle'
import { darkTheme, lightTheme } from '../styles/theme'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  const mode = useAppSelector((state) => state.ui.theme)

  const currentTheme = mode === 'DARK' ? darkTheme : lightTheme

  useEffect(() => {
    window.localStorage.setItem('task-planner-theme', mode)
  }, [mode])

  const configTheme = useMemo(
    () => ({
      algorithm: mode === 'DARK' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      token: {
        colorPrimary: currentTheme.colors.mainBarBackground,
        colorBgBase: currentTheme.colors.background,
        colorTextBase: currentTheme.colors.text,
        colorBorder: currentTheme.colors.border,
      },
    }),
    [currentTheme.colors.background, currentTheme.colors.border, currentTheme.colors.mainBarBackground, currentTheme.colors.text, mode],
  )

  return (
    <ConfigProvider theme={configTheme}>
      <ThemeProvider theme={currentTheme}>
        <GlobalStyle />
        {children}
      </ThemeProvider>
    </ConfigProvider>
  )
}
