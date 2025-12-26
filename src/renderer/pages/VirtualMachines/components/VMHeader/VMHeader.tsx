import { useNavigate } from 'react-router-dom'
import { RefreshIcon } from '../../../../icons'
import { useAuthStore } from '../../../../stores/useAuthStore'

interface VMHeaderProps {
  onRefresh: () => void
  isLoading: boolean
}

export const VMHeader = ({ onRefresh, isLoading }: VMHeaderProps) => {
  const navigate = useNavigate()
  const { session, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between">
        {/* Left: Title and Server Info */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Virtual Machines</h2>
          {session && (
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
              <span>{session.clusterName || session.server.host}</span>
              <span className="text-slate-300">•</span>
              <span>{session.username}</span>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-200 disabled:opacity-50"
          >
            <RefreshIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-200 hover:text-slate-900"
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
