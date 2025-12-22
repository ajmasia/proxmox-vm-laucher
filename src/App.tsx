import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import ConnectionForm from './components/ConnectionForm'
import type { ProxmoxConnection } from './types/proxmox'

function App() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleConnect = async (connection: ProxmoxConnection) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const spiceConfig = await invoke<string>('connect_to_proxmox', { connection })
      console.log('SPICE Config received:', spiceConfig)
      setSuccess(true)
      // TODO: Save SPICE config to file and launch remote-viewer
    } catch (err) {
      setError(err as string)
      console.error('Connection error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">Proxmox VM Launcher</h1>
        <p className="mb-6 text-slate-600">
          Connect to your Proxmox virtual machines with ease
        </p>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-800">
            <strong>Error:</strong> {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-800">
            <strong>Success!</strong> Connected to Proxmox VM
          </div>
        )}

        {loading && (
          <div className="mb-4 rounded-md bg-blue-50 p-4 text-sm text-blue-800">
            Connecting to Proxmox...
          </div>
        )}

        <ConnectionForm onSubmit={handleConnect} />
      </div>
    </div>
  )
}

export default App
