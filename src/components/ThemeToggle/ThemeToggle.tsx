import { SunIcon, MoonIcon, ComputerIcon } from '../../icons'
import { useThemeStore } from '../../stores/themeStore'

const ThemeToggle = () => {
  const { theme, cycleTheme } = useThemeStore()

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <SunIcon className="h-4 w-4" />
      case 'dark':
        return <MoonIcon className="h-4 w-4" />
      case 'system':
        return <ComputerIcon className="h-4 w-4" />
    }
  }

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light'
      case 'dark':
        return 'Dark'
      case 'system':
        return 'System'
    }
  }

  return (
    <button
      onClick={cycleTheme}
      className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
      title={`Theme: ${getLabel()} (click to cycle)`}
    >
      {getIcon()}
      <span className="hidden sm:inline">{getLabel()}</span>
    </button>
  )
}

export default ThemeToggle
