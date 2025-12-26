import { useAuthStore } from '../../stores/authStore'
import { useVMStore } from '../../stores/vmStore'
import { useThemeStore } from '../../stores/themeStore'
import { SunIcon, MoonIcon, ComputerIcon } from '../../icons'
import { Tooltip } from '../Tooltip/Tooltip'

interface TitleBarProps {
  title?: string
}

// Circular button component for title bar
function TitleBarButton({
  onClick,
  tooltip,
  children,
  variant = 'default',
}: {
  onClick: () => void
  tooltip: string
  children: React.ReactNode
  variant?: 'default' | 'close'
}) {
  const baseClasses = 'flex h-7 w-7 items-center justify-center rounded-lg transition-all'
  const variantClasses =
    variant === 'close'
      ? 'bg-ctp-surface1/50 text-ctp-subtext0 hover:text-ctp-text'
      : 'text-ctp-text hover:bg-ctp-surface1/50'

  return (
    <Tooltip text={tooltip}>
      <button onClick={onClick} className={`${baseClasses} ${variantClasses}`}>
        {children}
      </button>
    </Tooltip>
  )
}

export function TitleBar({ title = 'PVE Launcher' }: TitleBarProps) {
  const { logout } = useAuthStore()
  const { loadVMs } = useVMStore()
  const { theme, cycleTheme } = useThemeStore()

  const handleClose = () => {
    window.electronAPI.closeWindow()
  }

  const handleLogout = () => {
    logout()
  }

  const handleRefresh = () => {
    loadVMs()
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <SunIcon className="h-4 w-4" />
      case 'dark':
        return <MoonIcon className="h-4 w-4" />
      case 'system':
        return <ComputerIcon className="h-4 w-4" />
    }
  }

  const getThemeLabel = () => {
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
    <div
      className="flex select-none items-center justify-between bg-ctp-mantle px-3 py-3"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left side - logout and refresh */}
      <div
        className="z-10 flex items-center gap-1.5"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <TitleBarButton onClick={handleLogout} tooltip="Logout">
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </TitleBarButton>
        <TitleBarButton onClick={handleRefresh} tooltip="Refresh VMs">
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </TitleBarButton>
      </div>

      {/* Center - title */}
      <div className="pointer-events-none absolute inset-x-0 flex items-center justify-center py-3">
        <span className="text-sm font-medium text-ctp-subtext0">{title}</span>
      </div>

      {/* Right side - theme toggle and close */}
      <div
        className="z-10 flex items-center gap-1.5"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <TitleBarButton onClick={cycleTheme} tooltip={`Theme: ${getThemeLabel()}`}>
          {getThemeIcon()}
        </TitleBarButton>
        <div className="w-1" />
        <TitleBarButton onClick={handleClose} tooltip="Close" variant="close">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.3 5.71a1 1 0 0 0-1.42 0L12 10.59 7.12 5.71a1 1 0 0 0-1.42 1.42L10.59 12l-4.89 4.88a1 1 0 1 0 1.42 1.42L12 13.41l4.88 4.89a1 1 0 0 0 1.42-1.42L13.41 12l4.89-4.88a1 1 0 0 0 0-1.41z" />
          </svg>
        </TitleBarButton>
      </div>
    </div>
  )
}
