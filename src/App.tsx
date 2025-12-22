import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import ServerConfig from './components/ServerConfig'
import VMList from './components/VMList'
import type { ProxmoxServerConfig, ProxmoxVM } from './types/proxmox'

function App() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hasConfig, setHasConfig] = useState(false)
  const [configLoaded, setConfigLoaded] = useState(false)
  const [vms, setVms] = useState<ProxmoxVM[]>([])
  const [loadingVMs, setLoadingVMs] = useState(false)

  useEffect(() => {
    checkConfig()
  }, [])

  const checkConfig = async () => {
    try {
      await invoke('load_server_config')
      setHasConfig(true)
      setConfigLoaded(true)
      // Load VMs after config is confirmed
      await loadVMs()
    } catch (err) {
      setHasConfig(false)
      setConfigLoaded(true)
    }
  }

  const loadVMs = async () => {
    setLoadingVMs(true)
    setError(null)

    try {
      const vmList = await invoke<ProxmoxVM[]>('list_vms')
      setVms(vmList)
    } catch (err) {
      setError(err as string)
      console.error('Error loading VMs:', err)
    } finally {
      setLoadingVMs(false)
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

  useEffect(() => {
    if (hasConfig && configLoaded && vms.length === 0 && !loadingVMs) {
      loadVMs()
    }
  }, [hasConfig, configLoaded])

  const handleSelectVM = async (vm: ProxmoxVM) => {
    // Check if VM is stopped
    if (vm.status === 'stopped') {
      const confirmStart = window.confirm(
        `VM "${vm.name}" is currently stopped. Do you want to start it?`
      )

      if (!confirmStart) {
        return
      }

      // Start the VM
      setLoading(true)
      setError(null)

      try {
        await invoke('start_vm', { node: vm.node, vmid: vm.vmid })

        // Wait for VM to start (polling or fixed delay)
        setSuccess(true)
        setError('VM is starting... Please wait 30 seconds and try connecting again.')

        // Refresh VM list after a delay
        setTimeout(() => {
          loadVMs()
        }, 30000)
      } catch (err) {
        setError(`Failed to start VM: ${err}`)
      } finally {
        setLoading(false)
      }
    } else if (vm.status === 'running') {
      // VM is running, connect directly
      console.log('Connecting to running VM:', vm)
      // TODO: Implement SPICE connection
      setError('SPICE connection not yet implemented')
    } else {
      setError(`VM is in ${vm.status} state. Cannot connect.`)
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
      <div className="w-full max-w-5xl rounded-lg bg-white p-8 shadow-2xl">
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
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Your Virtual Machines</h2>
              <button
                onClick={() => setHasConfig(false)}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Reconfigure
              </button>
            </div>

            {loadingVMs && (
              <div className="mb-4 rounded-md bg-blue-50 p-4 text-sm text-blue-800">
                Loading virtual machines...
              </div>
            )}

            <VMList vms={vms} onSelectVM={handleSelectVM} loading={loadingVMs} />

            <button
              onClick={loadVMs}
              disabled={loadingVMs}
              className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              Refresh List
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
