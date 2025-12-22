import type { ProxmoxServerConfig } from '../../../../types/proxmox'

interface ServerSelectorProps {
  servers: ProxmoxServerConfig[]
  selectedServer: ProxmoxServerConfig | null
  onSelectServer: (server: ProxmoxServerConfig) => void
  onAddServer: () => void
}

export default function ServerSelector({
  servers,
  selectedServer,
  onSelectServer,
  onAddServer,
}: ServerSelectorProps) {
  if (servers.length === 0) {
    return (
      <div className="mb-6 text-center">
        <p className="mb-4 text-sm text-slate-600">No servers configured yet</p>
        <button
          onClick={onAddServer}
          className="w-full rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          Add Server
        </button>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <label className="mb-2 block text-sm font-medium text-slate-700">Server</label>
      <div className="space-y-2">
        {servers.map((server) => (
          <button
            key={server.id}
            onClick={() => onSelectServer(server)}
            className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
              selectedServer?.id === server.id
                ? 'border-slate-700 bg-slate-50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-slate-900">{server.name}</div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {server.username}@{server.host}:{server.port}
                </div>
              </div>
              {selectedServer?.id === server.id && (
                <div className="ml-2">
                  <svg
                    className="h-5 w-5 text-slate-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onAddServer}
        className="mt-3 w-full rounded-lg border-2 border-dashed border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
      >
        + Add New Server
      </button>
    </div>
  )
}
