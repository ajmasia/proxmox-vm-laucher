import { useNavigate } from 'react-router-dom'
import { MonitorIcon, RefreshIcon } from '../../../icons'
import ThemeToggle from '../../../components/ThemeToggle/ThemeToggle'
import UpdateBadge from '../../../components/UpdateBadge/UpdateBadge'
import { useAuthStore } from '../../../stores/authStore'

interface AppHeaderProps {
  onRefresh: () => void
  isLoading: boolean
}

const AppHeader = ({ onRefresh, isLoading }: AppHeaderProps) => {
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="bg-white py-4 dark:bg-slate-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700 dark:bg-slate-600">
            <MonitorIcon className="h-6 w-6 text-white" />
          </div>
          {/* Title */}
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Proxmox</h2>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <h2 className="text-lg font-medium text-slate-600 dark:text-slate-300">Virtual Machines</h2>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            <RefreshIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <UpdateBadge />
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default AppHeader
