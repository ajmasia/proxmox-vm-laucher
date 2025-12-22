import { useEffect } from 'react'
import ServerConfig from '../../components/ServerConfig/ServerConfig'
import Alert from '../../components/Alert/Alert'
import VMHeader from './components/VMHeader/VMHeader'
import VMList from './components/VMList/VMList'
import VMFilter from './components/VMFilter/VMFilter'
import { useVMStore } from '../../stores/vmStore'
import { useConfigStore } from '../../stores/configStore'
import { useFilterStore } from '../../stores/filterStore'

const VirtualMachines = () => {
  // VM Store
  const {
    vms,
    loadingVMs,
    startingVMs,
    stoppingVMs,
    suspendingVMs,
    resumingVMs,
    error: vmError,
    loadVMs,
    startVM,
    stopVM,
    suspendVM,
    connectVM,
  } = useVMStore()

  // Config Store
  const {
    hasConfig,
    configLoaded,
    success,
    error: configError,
    checkConfig,
    saveConfig,
    setHasConfig,
  } = useConfigStore()

  // Filter Store
  const {
    statusFilter,
    tagFilter,
    setStatusFilter,
    setTagFilter,
    clearFilters,
    getUniqueTags,
    getFilteredVMs,
  } = useFilterStore()

  // Computed values
  const uniqueTags = getUniqueTags(vms)
  const filteredVMs = getFilteredVMs(vms)
  const error = vmError || configError

  // Initialize
  useEffect(() => {
    const init = async () => {
      await checkConfig()
      if (hasConfig) {
        await loadVMs()
      }
    }
    init()
  }, [])

  // Load VMs when config is available
  useEffect(() => {
    if (hasConfig && configLoaded && vms.length === 0 && !loadingVMs) {
      loadVMs()
    }
  }, [hasConfig, configLoaded, vms.length, loadingVMs, loadVMs])

  if (!configLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-900">Loading...</div>
      </div>
    )
  }

  return (
    <>
      {error && <Alert type="error" message={error} />}

      {success && <Alert type="success" message="Configuration saved successfully" />}

      {!hasConfig ? (
        <ServerConfig onSave={saveConfig} />
      ) : (
        <div className="space-y-4">
          <VMHeader
            onReconfigure={() => setHasConfig(false)}
            onRefresh={loadVMs}
            isLoading={loadingVMs}
          />

          <VMFilter
            statusFilter={statusFilter}
            tagFilter={tagFilter}
            uniqueTags={uniqueTags}
            onStatusFilterChange={setStatusFilter}
            onTagFilterChange={setTagFilter}
            onClearFilters={clearFilters}
          />

          <VMList
            vms={filteredVMs}
            onStartVM={startVM}
            onStopVM={stopVM}
            onSuspendVM={suspendVM}
            onConnectVM={connectVM}
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
    </>
  )
}

export default VirtualMachines
