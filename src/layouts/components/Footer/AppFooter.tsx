import { useAuthStore } from '../../../stores/authStore'

const AppFooter = () => {
  const { session } = useAuthStore()
  const appVersion = '0.1.0'

  return (
    <div className="bg-white py-3 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 text-xs text-slate-600">
        {/* Left: Connection Status and User */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${session ? 'bg-green-500' : 'bg-slate-400'}`} />
            <span>{session ? session.clusterName || session.server.host : 'Disconnected'}</span>
          </div>
          {session && (
            <>
              <span className="text-slate-300">•</span>
              <span>{session.username}</span>
            </>
          )}
        </div>

        {/* Right: App Version */}
        <div className="text-slate-500">v{appVersion}</div>
      </div>
    </div>
  )
}

export default AppFooter
