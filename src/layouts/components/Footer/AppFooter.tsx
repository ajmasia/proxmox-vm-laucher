import { useAuthStore } from '../../../stores/authStore'

const AppFooter = () => {
  const { session } = useAuthStore()
  const appVersion = '0.1.0'

  return (
    <div className="rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between text-xs text-slate-600">
        {/* Left: Connection Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${session ? 'bg-green-500' : 'bg-slate-400'}`} />
            <span>{session ? session.clusterName || session.server.host : 'Disconnected'}</span>
          </div>
        </div>

        {/* Right: App Version */}
        <div className="text-slate-500">v{appVersion}</div>
      </div>
    </div>
  )
}

export default AppFooter
