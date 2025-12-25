import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MonitorIcon } from '../../icons'
import { useAuthStore } from '../../stores/authStore'
import { useServerStore } from '../../stores/serverStore'
import type { ProxmoxServerConfig } from '../../types/proxmox'
import ServerSelector from './components/ServerSelector/ServerSelector'
import PasswordForm from './components/PasswordForm/PasswordForm'
import AddServerForm from './components/AddServerForm/AddServerForm'

const Login = () => {
  const navigate = useNavigate()
  const { login, isAuthenticating, error: authError, clearError } = useAuthStore()
  const { servers, loadServers, getLastUsedServer, setLastUsedServer, deleteServer } =
    useServerStore()

  const [selectedServer, setSelectedServer] = useState<ProxmoxServerConfig | null>(null)
  const [showAddServer, setShowAddServer] = useState(false)

  useEffect(() => {
    loadServers()
  }, [loadServers])

  useEffect(() => {
    // Auto-select last used server
    if (servers.length > 0 && !selectedServer) {
      const lastUsed = getLastUsedServer()
      setSelectedServer(lastUsed || servers[0])
    }
  }, [servers, selectedServer, getLastUsedServer])

  const handleLogin = async (password: string) => {
    if (!selectedServer) return

    try {
      await login(selectedServer, password)
      await setLastUsedServer(selectedServer.id)
      navigate('/virtual-machines')
    } catch (error) {
      // Error is already handled by authStore
      console.error('Login failed:', error)
    }
  }

  const handleServerSelect = (server: ProxmoxServerConfig) => {
    setSelectedServer(server)
    clearError()
  }

  const handleAddServer = () => {
    setShowAddServer(true)
  }

  const handleServerAdded = (server: ProxmoxServerConfig) => {
    setShowAddServer(false)
    setSelectedServer(server)
  }

  const handleDeleteServer = async (serverId: string) => {
    await deleteServer(serverId)
    // If deleted server was selected, clear selection
    if (selectedServer?.id === serverId) {
      setSelectedServer(servers.length > 1 ? servers[0] : null)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-900 dark:to-slate-800">
      <div className="animate-scale-in w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-lg ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-700 shadow-lg">
                <MonitorIcon className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Proxmox VM Launcher
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Select a server and enter your password to continue
            </p>
          </div>

          {/* Content */}
          {showAddServer ? (
            <AddServerForm
              onCancel={() => setShowAddServer(false)}
              onServerAdded={handleServerAdded}
            />
          ) : (
            <>
              <ServerSelector
                servers={servers}
                selectedServer={selectedServer}
                onSelectServer={handleServerSelect}
                onAddServer={handleAddServer}
                onDeleteServer={handleDeleteServer}
              />

              {selectedServer && (
                <PasswordForm
                  server={selectedServer}
                  isLoading={isAuthenticating}
                  error={authError}
                  onSubmit={handleLogin}
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-500">
          Your credentials are never stored. Sessions are kept in memory only.
        </p>
      </div>
    </div>
  )
}

export default Login
