import { useEffect } from 'react'
import ServerConfig from '../../components/ServerConfig/ServerConfig'
import Alert from '../../components/Alert/Alert'
import VMHeader from './components/VMHeader/VMHeader'
import VMList from './components/VMList/VMList'
import VMFilter from './components/VMFilter/VMFilter'
import { useVirtualMachines } from './hooks/useVirtualMachines'
import { useServerConfig } from './hooks/useServerConfig'
import { useVMFilters } from './hooks/useVMFilters'

const VirtualMachines = () => {
  // Config
  const {
    hasConfig,
    configLoaded,
    success,
    error: configError,
    checkConfig,
    saveConfig,
    reconfigure,
  } = useServerConfig()

  // Virtual Machines
  const {
    vms,
    loading,
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
  } = useVirtualMachines()

  // Filters
  const {
    statusFilter,
    tagFilter,
    uniqueTags,
    filteredVMs,
    setStatusFilter,
    setTagFilter,
    clearFilters,
  } = useVMFilters(vms)

  const error = vmError || configError

  // Initialize
  useEffect(() => {
    checkConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load VMs when config is available
  useEffect(() => {
    if (hasConfig && configLoaded && vms.length === 0 && !loading) {
      loadVMs()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasConfig, configLoaded])

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
            onReconfigure={reconfigure}
            onRefresh={loadVMs}
            isLoading={loading}
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
            loading={loading}
            startingVMs={startingVMs}
            stoppingVMs={stoppingVMs}
            suspendingVMs={suspendingVMs}
            resumingVMs={resumingVMs}
          />

          {!loading && filteredVMs.length === 0 && vms.length > 0 && (
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
