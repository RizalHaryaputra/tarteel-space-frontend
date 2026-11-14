export type ThemeMode = 'dark' | 'light'

const THEME_STORAGE_KEY = 'ts-theme'

export const useTheme = () => {
  const theme = useState<ThemeMode>('ts-theme', () => 'dark')

  const applyTheme = (mode: ThemeMode) => {
    if (!import.meta.client) return
    const root = document.documentElement
    root.classList.toggle('light', mode === 'light')

    const metaTheme = document.querySelector('meta[name="theme-color"]')
    if (metaTheme) {
      metaTheme.setAttribute('content', mode === 'light' ? '#f8fafc' : '#0b0d11')
    }
  }

  const initTheme = () => {
    if (!import.meta.client) return
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY)
      const resolved: ThemeMode = saved === 'light' ? 'light' : 'dark'
      theme.value = resolved
      applyTheme(resolved)
    } catch {
      theme.value = 'dark'
      applyTheme('dark')
    }
  }

  const setTheme = (mode: ThemeMode) => {
    theme.value = mode
    if (import.meta.client) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, mode)
      } catch {
        // Ignore storage errors (e.g. private browsing restrictions)
      }
      applyTheme(mode)
    }
  }

  const toggleTheme = () => {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  return {
    theme,
    initTheme,
    setTheme,
    toggleTheme,
  }
}

