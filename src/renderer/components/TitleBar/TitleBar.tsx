import { useAuthStore } from '../../stores/useAuthStore'
import { useVMStore } from '../../stores/useVMStore'
import { useThemeStore } from '../../stores/useThemeStore'
import { SunIcon, MoonIcon, ComputerIcon, LogoutIcon, RefreshIcon, CloseIcon } from '../../icons'
import { TitleBarButton } from './components/TitleBarButton'

interface TitleBarProps {
  title?: string
}

export const TitleBar = ({ title = 'PVE Launcher' }: TitleBarProps) => {
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
        return SunIcon
      case 'dark':
        return MoonIcon
      case 'system':
        return ComputerIcon
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
        <TitleBarButton onClick={handleLogout} tooltip="Logout" icon={LogoutIcon} />
        <TitleBarButton onClick={handleRefresh} tooltip="Refresh VMs" icon={RefreshIcon} />
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
        <TitleBarButton
          onClick={cycleTheme}
          tooltip={`Theme: ${getThemeLabel()}`}
          icon={getThemeIcon()}
        />
        <div className="w-1" />
        <TitleBarButton
          onClick={handleClose}
          tooltip="Close"
          icon={CloseIcon}
          iconClassName="h-3.5 w-3.5"
          variant="close"
        />
      </div>
    </div>
  )
}
