import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../../stores/authStore'

const AppFooter = () => {
  const { session } = useAuthStore()
  const [appVersion, setAppVersion] = useState<string>('')

  useEffect(() => {
    window.electronAPI.getVersion().then(setAppVersion)
  }, [])

  return (
    <div className="bg-ctp-mantle py-4 shadow-sm">
      <div className="flex items-center justify-between px-6 text-xs text-ctp-subtext0">
        {/* Left: Connection Status and User */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className={`h-2 w-2 rounded-full ${session ? 'bg-ctp-green' : 'bg-ctp-overlay0'}`}
            />
            <span>{session ? session.clusterName || session.server.host : 'Disconnected'}</span>
          </div>
          {session && (
            <>
              <span className="text-ctp-surface2">•</span>
              <span>{session.username}</span>
            </>
          )}
        </div>

        {/* Right: Beta + Version */}
        {appVersion && (
          <div className="flex items-center gap-1.5">
            <span className="rounded-md bg-ctp-surface0 px-1.5 py-0.5 text-xs font-medium text-ctp-subtext0">
              Beta
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-ctp-surface0 px-2 py-0.5 text-xs font-medium text-ctp-subtext1 ring-1 ring-ctp-surface1">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              v{appVersion}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export { AppFooter }
