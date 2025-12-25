import { useAuthStore } from '../stores/authStore'
import { useVMStore } from '../stores/vmStore'
import { useThemeStore } from '../stores/themeStore'
import { SunIcon, MoonIcon, ComputerIcon } from '../icons'

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
  variant?: 'default' | 'danger'
}) {
  const baseClasses = 'flex h-6 w-6 items-center justify-center rounded-full transition-all'
  const variantClasses =
    variant === 'danger'
      ? 'bg-slate-600/50 text-slate-400 hover:text-white dark:bg-slate-700/50 dark:text-slate-400 dark:hover:text-white'
      : 'bg-slate-600/50 text-slate-400 hover:text-white dark:bg-slate-700/50 dark:text-slate-400 dark:hover:text-white'

  return (
    <div className="group relative">
      <button onClick={onClick} className={`${baseClasses} ${variantClasses}`}>
        {children}
      </button>
      <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="whitespace-nowrap rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 shadow-lg dark:bg-slate-900">
          {tooltip}
        </div>
      </div>
    </div>
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
        return <SunIcon className="h-3.5 w-3.5" />
      case 'dark':
        return <MoonIcon className="h-3.5 w-3.5" />
      case 'system':
        return <ComputerIcon className="h-3.5 w-3.5" />
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
      className="flex select-none items-center justify-between bg-slate-700 px-3 py-3 dark:bg-slate-800"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left side - logout and refresh */}
      <div
        className="z-10 flex items-center gap-1.5"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <TitleBarButton onClick={handleLogout} tooltip="Logout">
          <svg
            className="h-3.5 w-3.5"
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
            className="h-3.5 w-3.5"
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
        <span className="text-sm font-medium text-slate-300">{title}</span>
      </div>

      {/* Right side - theme toggle and close */}
      <div
        className="z-10 flex items-center gap-1.5"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <TitleBarButton onClick={cycleTheme} tooltip={`Theme: ${getThemeLabel()}`}>
          {getThemeIcon()}
        </TitleBarButton>
        <TitleBarButton onClick={handleClose} tooltip="Close">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.3 5.71a1 1 0 0 0-1.42 0L12 10.59 7.12 5.71a1 1 0 0 0-1.42 1.42L10.59 12l-4.89 4.88a1 1 0 1 0 1.42 1.42L12 13.41l4.88 4.89a1 1 0 0 0 1.42-1.42L13.41 12l4.89-4.88a1 1 0 0 0 0-1.41z" />
          </svg>
        </TitleBarButton>
      </div>
    </div>
  )
}
