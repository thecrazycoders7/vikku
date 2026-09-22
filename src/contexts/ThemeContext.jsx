import { createContext, useContext, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  // Vikku brand is light-only. Force the `light` class and clear any stale
  // 'dark' preference from returning users.
  useEffect(() => {
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')
    localStorage.setItem('theme', 'light')
  }, [])

  const toggle = () => {} // no-op: theme toggle removed

  return <ThemeContext.Provider value={{ theme: 'light', toggle }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
