import { useEffect, useState } from 'react'
import { MonitorIcon } from '../../icons'
import { useAuthStore } from '../../stores/authStore'
import { useServerStore } from '../../stores/serverStore'
import type { ProxmoxServerConfig } from '../../types/proxmox'
import ServerSelector from './components/ServerSelector/ServerSelector'
import PasswordForm from './components/PasswordForm/PasswordForm'

const Login = () => {
  const { login, isAuthenticating, error: authError, clearError } = useAuthStore()
  const { servers, loadServers, getLastUsedServer, setLastUsedServer, deleteServer } =
    useServerStore()

  const [selectedServer, setSelectedServer] = useState<ProxmoxServerConfig | null>(null)

  useEffect(() => {
    loadServers()

    // Reload servers when window gains focus (to pick up newly added servers)
    const handleFocus = () => {
      loadServers()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
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
      // Session is transferred via IPC, main window opens, login window closes automatically
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
    window.electronAPI.openAddServerWindow()
  }

  const handleDeleteServer = async (serverId: string) => {
    await deleteServer(serverId)
    // If deleted server was selected, clear selection
    if (selectedServer?.id === serverId) {
      setSelectedServer(servers.length > 1 ? servers[0] : null)
    }
  }

  return (
    <div className="relative flex h-screen flex-col bg-ctp-base">
      {/* Draggable region for moving window */}
      <div
        className="absolute inset-x-0 top-0 h-10"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      />

      {/* Content - takes full height */}
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ctp-mauve shadow-lg">
              <MonitorIcon className="h-10 w-10 text-ctp-base" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-ctp-text">Proxmox VM Launcher</h1>
          <p className="mt-2 text-sm text-ctp-subtext0">
            Select a server and enter your password to continue
          </p>
        </div>

        {/* Form */}
        <div className="w-full max-w-sm">
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
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-ctp-subtext0">
          Your credentials are never stored. Sessions are kept in memory only.
        </p>
      </div>
    </div>
  )
}

export default Login
