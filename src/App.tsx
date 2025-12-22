import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import ServerConfig from './components/ServerConfig'
import type { ProxmoxServerConfig } from './types/proxmox'

function App() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hasConfig, setHasConfig] = useState(false)
  const [configLoaded, setConfigLoaded] = useState(false)

  useEffect(() => {
    checkConfig()
  }, [])

  const checkConfig = async () => {
    try {
      await invoke('load_server_config')
      setHasConfig(true)
    } catch (err) {
      setHasConfig(false)
    } finally {
      setConfigLoaded(true)
    }
  }

  const handleSaveConfig = async (config: ProxmoxServerConfig) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await invoke('save_server_config', { config })
      setSuccess(true)
      setHasConfig(true)
      console.log('Configuration saved successfully')
    } catch (err) {
      setError(err as string)
      console.error('Error saving configuration:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!configLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">Proxmox VM Launcher</h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-800">
            <strong>Error:</strong> {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-800">
            <strong>Success!</strong> Configuration saved securely
          </div>
        )}

        {loading && (
          <div className="mb-4 rounded-md bg-blue-50 p-4 text-sm text-blue-800">
            Saving configuration...
          </div>
        )}

        {!hasConfig ? (
          <ServerConfig onSave={handleSaveConfig} />
        ) : (
          <div>
            <p className="text-slate-600">Configuration loaded successfully!</p>
            <button
              onClick={() => setHasConfig(false)}
              className="mt-4 w-full rounded-md bg-slate-600 px-4 py-2 text-white transition-colors hover:bg-slate-700"
            >
              Reconfigure Server
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
