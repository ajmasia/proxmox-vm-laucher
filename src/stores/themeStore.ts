import { create } from 'zustand'

const THEME_KEY = 'pve-launcher-theme'

type Theme = 'light' | 'dark' | 'system'

interface ThemeStore {
  // State
  theme: Theme
  resolvedTheme: 'light' | 'dark'

  // Actions
  initTheme: () => Promise<void>
  setTheme: (theme: Theme) => Promise<void>
  cycleTheme: () => Promise<void>
}

// Get system preference
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

// Apply theme to document
const applyTheme = (resolvedTheme: 'light' | 'dark') => {
  if (resolvedTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Resolve theme based on preference
const resolveTheme = (theme: Theme): 'light' | 'dark' => {
  if (theme === 'system') {
    return getSystemTheme()
  }
  return theme
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  // Initial state
  theme: 'system',
  resolvedTheme: 'light',

  // Initialize theme from storage or system preference
  initTheme: async () => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null
      const theme = savedTheme || 'system'
      const resolvedTheme = resolveTheme(theme)

      applyTheme(resolvedTheme)
      set({ theme, resolvedTheme })

      // Listen for system theme changes when in system mode
      if (typeof window !== 'undefined' && window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        mediaQuery.addEventListener('change', (e) => {
          if (get().theme === 'system') {
            const newResolvedTheme = e.matches ? 'dark' : 'light'
            applyTheme(newResolvedTheme)
            set({ resolvedTheme: newResolvedTheme })
          }
        })
      }
    } catch (error) {
      console.error('Failed to initialize theme:', error)
      // Fallback to system theme
      const resolvedTheme = getSystemTheme()
      applyTheme(resolvedTheme)
      set({ theme: 'system', resolvedTheme })
    }
  },

  // Set theme and persist
  setTheme: async (theme) => {
    const resolvedTheme = resolveTheme(theme)
    applyTheme(resolvedTheme)
    set({ theme, resolvedTheme })

    // Save to localStorage
    localStorage.setItem(THEME_KEY, theme)
  },

  // Cycle through themes: light -> dark -> system
  cycleTheme: async () => {
    const currentTheme = get().theme
    let nextTheme: Theme

    switch (currentTheme) {
      case 'light':
        nextTheme = 'dark'
        break
      case 'dark':
        nextTheme = 'system'
        break
      case 'system':
      default:
        nextTheme = 'light'
        break
    }

    await get().setTheme(nextTheme)
  },
}))
