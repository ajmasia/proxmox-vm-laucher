import { SunIcon, MoonIcon, ComputerIcon } from '../../icons'
import { useThemeStore } from '../../stores/themeStore'
import Tooltip from '../Tooltip/Tooltip'

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
    <Tooltip text={`Theme: ${getLabel()} (click to cycle)`}>
      <button
        onClick={cycleTheme}
        className="inline-flex items-center gap-2 rounded-lg bg-ctp-surface0 px-3 py-2 text-sm font-medium text-ctp-text transition-all hover:bg-ctp-surface1"
      >
        {getIcon()}
        <span className="hidden sm:inline">{getLabel()}</span>
      </button>
    </Tooltip>
  )
}

export default ThemeToggle
