import type { ProxmoxServerConfig } from '../../../../types/proxmox'

interface ServerSelectorProps {
  servers: ProxmoxServerConfig[]
  selectedServer: ProxmoxServerConfig | null
  onSelectServer: (server: ProxmoxServerConfig) => void
  onAddServer: () => void
  onDeleteServer: (serverId: string) => void
}

const ServerSelector = ({
  servers,
  selectedServer,
  onSelectServer,
  onAddServer,
  onDeleteServer,
}: ServerSelectorProps) => {
  if (servers.length === 0) {
    return (
      <div className="mb-6 text-center">
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">No servers configured yet</p>
        <button
          onClick={onAddServer}
          className="w-full rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
        >
          Add Server
        </button>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Server</label>
      <div className="space-y-2">
        {servers.map((server) => (
          <div
            key={server.id}
            className={`group flex items-center gap-2 rounded-lg border-2 p-3 transition-all ${
              selectedServer?.id === server.id
                ? 'border-slate-700 bg-slate-50 shadow-sm dark:border-slate-500 dark:bg-slate-700/50'
                : 'border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-700'
            }`}
          >
            <button
              onClick={() => onSelectServer(server)}
              className="flex-1 text-left transition-all hover:opacity-80"
            >
              <div className="font-medium text-slate-900 dark:text-slate-100">{server.name}</div>
              <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {server.username}@{server.host}:{server.port}
              </div>
            </button>
            <div className="flex flex-shrink-0 items-center gap-1">
              <button
                onClick={() => onDeleteServer(server.id)}
                className="rounded p-1 text-slate-400 opacity-0 transition-all hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100 dark:hover:bg-slate-600 dark:hover:text-slate-300"
                title="Delete server"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
              {selectedServer?.id === server.id && (
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-slate-700 dark:text-slate-300"
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
          </div>
        ))}
      </div>

      <button
        onClick={onAddServer}
        className="mt-3 w-full rounded-lg border-2 border-dashed border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-600 dark:hover:text-slate-100 dark:focus:ring-offset-slate-800"
      >
        + Add New Server
      </button>
    </div>
  )
}

export default ServerSelector
