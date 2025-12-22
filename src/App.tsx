import { useState, useEffect, useCallback, useMemo } from 'react'
import { invoke } from '@tauri-apps/api/core'
import ServerConfig from './components/ServerConfig'
import VMList from './components/VMList'
import { RefreshIcon } from './components/Icons'
import type { ProxmoxServerConfig, ProxmoxVM } from './types/proxmox'

function App() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hasConfig, setHasConfig] = useState(false)
  const [configLoaded, setConfigLoaded] = useState(false)
  const [vmMap, setVmMap] = useState<Map<number, ProxmoxVM>>(new Map())
  const [loadingVMs, setLoadingVMs] = useState(false)
  const [startingVMs, setStartingVMs] = useState<Set<number>>(new Set())
  const [stoppingVMs, setStoppingVMs] = useState<Set<number>>(new Set())
  const [suspendingVMs, setSuspendingVMs] = useState<Set<number>>(new Set())
  const [resumingVMs, setResumingVMs] = useState<Set<number>>(new Set())
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [tagFilter, setTagFilter] = useState<string>('all')

  // Convert map to array for rendering
  const vms = useMemo(() => Array.from(vmMap.values()), [vmMap])

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

  const loadVMs = useCallback(async () => {
    setLoadingVMs(true)
    setError(null)

    try {
      const vmList = await invoke<ProxmoxVM[]>('list_vms')
      console.log('VM list loaded:', vmList)

      // Update map with new VMs
      setVmMap(new Map(vmList.map(vm => [vm.vmid, vm])))
    } catch (err) {
      setError(err as string)
      console.error('Error loading VMs:', err)
    } finally {
      setLoadingVMs(false)
    }
  }, [])

  // Refresh a single VM from the server
  const refreshSingleVM = useCallback(async (vmid: number) => {
    try {
      // Get all VMs to find the updated one
      const vmList = await invoke<ProxmoxVM[]>('list_vms')
      const updatedVM = vmList.find(vm => vm.vmid === vmid)

      if (updatedVM) {
        setVmMap(prev => {
          const newMap = new Map(prev)
          newMap.set(vmid, updatedVM)
          return newMap
        })
      }
    } catch (err) {
      console.error('Error refreshing single VM:', err)
    }
  }, [])

  const handleSaveConfig = async (config: ProxmoxServerConfig) => {
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
    }
  }

  useEffect(() => {
    if (hasConfig && configLoaded && vmMap.size === 0 && !loadingVMs) {
      loadVMs()
    }
  }, [hasConfig, configLoaded, vmMap.size, loadingVMs, loadVMs])

  const handleConnectVM = useCallback(async (vm: ProxmoxVM) => {
    setError(null)

    try {
      await invoke('connect_to_proxmox', { node: vm.node, vmid: vm.vmid })
      setSuccess(true)
      console.log('SPICE viewer launched successfully')
    } catch (err) {
      setError(`Failed to connect to VM: ${err}`)
      console.error('Error connecting to VM:', err)
    }
  }, [])

  const handleStartVM = useCallback(async (vm: ProxmoxVM) => {
    setError(null)

    // If VM is paused, use resume instead of start
    if (vm.status === 'paused') {
      setResumingVMs((prev) => new Set(prev).add(vm.vmid))

      try {
        await invoke('resume_vm', { node: vm.node, vmid: vm.vmid })
        console.log('VM resume command sent')

        // Wait 5 seconds for state to change, then refresh only this VM
        setTimeout(async () => {
          console.log('Refreshing VM after resume')
          await refreshSingleVM(vm.vmid)
          // Clear resuming state after refresh
          setResumingVMs((prev) => {
            const newSet = new Set(prev)
            newSet.delete(vm.vmid)
            return newSet
          })
        }, 5000)
      } catch (err) {
        setError(`Failed to resume VM: ${err}`)
        setResumingVMs((prev) => {
          const newSet = new Set(prev)
          newSet.delete(vm.vmid)
          return newSet
        })
      }
    } else {
      // Normal start for stopped VMs
      setStartingVMs((prev) => new Set(prev).add(vm.vmid))

      try {
        await invoke('start_vm', { node: vm.node, vmid: vm.vmid })
        console.log('VM start command sent')

        // Wait 30 seconds for VM to start, then refresh only this VM
        setTimeout(async () => {
          await refreshSingleVM(vm.vmid)
          setStartingVMs((prev) => {
            const newSet = new Set(prev)
            newSet.delete(vm.vmid)
            return newSet
          })
        }, 30000)
      } catch (err) {
        setError(`Failed to start VM: ${err}`)
        setStartingVMs((prev) => {
          const newSet = new Set(prev)
          newSet.delete(vm.vmid)
          return newSet
        })
      }
    }
  }, [refreshSingleVM])

  const handleSuspendVM = useCallback(async (vm: ProxmoxVM) => {
    setError(null)
    setSuspendingVMs((prev) => new Set(prev).add(vm.vmid))

    try {
      await invoke('suspend_vm', { node: vm.node, vmid: vm.vmid })
      console.log('VM suspended successfully')

      // Wait a moment for the state to change, then refresh only this VM
      setTimeout(async () => {
        console.log('Refreshing VM after suspend')
        await refreshSingleVM(vm.vmid)
        // Clear suspending state after refresh
        setSuspendingVMs((prev) => {
          const newSet = new Set(prev)
          newSet.delete(vm.vmid)
          return newSet
        })
      }, 5000)
    } catch (err) {
      setError(`Failed to suspend VM: ${err}`)
      console.error('Error suspending VM:', err)
      setSuspendingVMs((prev) => {
        const newSet = new Set(prev)
        newSet.delete(vm.vmid)
        return newSet
      })
    }
  }, [refreshSingleVM])

  // Extract unique tags from all VMs
  const uniqueTags = Array.from(
    new Set(
      vms
        .filter((vm) => vm.tags && vm.tags.trim())
        .flatMap((vm) => vm.tags!.split(';').map((tag) => tag.trim()))
        .filter((tag) => tag)
    )
  ).sort()

  // Filter VMs based on status and tag
  const filteredVMs = vms.filter((vm) => {
    const statusMatch = statusFilter === 'all' || vm.status === statusFilter
    const tagMatch =
      tagFilter === 'all' ||
      (vm.tags &&
        vm.tags
          .split(';')
          .map((tag) => tag.trim())
          .includes(tagFilter))
    return statusMatch && tagMatch
  })

  const handleStopVM = useCallback(async (vm: ProxmoxVM) => {
    setError(null)
    setStoppingVMs((prev) => new Set(prev).add(vm.vmid))

    try {
      await invoke('stop_vm', { node: vm.node, vmid: vm.vmid })
      console.log('VM stopped successfully')

      // Wait a moment for the state to change, then refresh only this VM
      setTimeout(async () => {
        console.log('Refreshing VM after stop')
        await refreshSingleVM(vm.vmid)
        // Clear stopping state after refresh
        setStoppingVMs((prev) => {
          const newSet = new Set(prev)
          newSet.delete(vm.vmid)
          return newSet
        })
      }, 5000)
    } catch (err) {
      setError(`Failed to stop VM: ${err}`)
      console.error('Error stopping VM:', err)
      setStoppingVMs((prev) => {
        const newSet = new Set(prev)
        newSet.delete(vm.vmid)
        return newSet
      })
    }
  }, [refreshSingleVM])

  if (!configLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Proxmox VM Launcher</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your virtual machines</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-800">Configuration saved successfully</p>
              </div>
            </div>
          </div>
        )}

        {!hasConfig ? (
          <ServerConfig onSave={handleSaveConfig} />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Virtual Machines</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setHasConfig(false)}
                  className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
                >
                  Reconfigure
                </button>
                <button
                  onClick={loadVMs}
                  disabled={loadingVMs}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-black/5 transition-all hover:bg-slate-50 disabled:opacity-50"
                >
                  <RefreshIcon className={loadingVMs ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All</option>
                  <option value="running">Running</option>
                  <option value="stopped">Stopped</option>
                  <option value="paused">Paused</option>
                </select>
              </div>

              {uniqueTags.length > 0 && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700">Tag:</label>
                  <select
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Tags</option>
                    {uniqueTags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(statusFilter !== 'all' || tagFilter !== 'all') && (
                <button
                  onClick={() => {
                    setStatusFilter('all')
                    setTagFilter('all')
                  }}
                  className="ml-auto text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
                >
                  Clear filters
                </button>
              )}
            </div>

            <VMList
              vms={filteredVMs}
              onStartVM={handleStartVM}
              onStopVM={handleStopVM}
              onSuspendVM={handleSuspendVM}
              onConnectVM={handleConnectVM}
              loading={loadingVMs}
              startingVMs={startingVMs}
              stoppingVMs={stoppingVMs}
              suspendingVMs={suspendingVMs}
              resumingVMs={resumingVMs}
            />

            {!loadingVMs && filteredVMs.length === 0 && vms.length > 0 && (
              <div className="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
                <p className="text-slate-500">No virtual machines match the current filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
