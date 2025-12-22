import { useEffect } from 'react'
import Alert from '../../components/Alert/Alert'
import VMList from './components/VMList/VMList'
import VMFilter from './components/VMFilter/VMFilter'
import { useVirtualMachines } from './hooks/useVirtualMachines'
import { useVMFilters } from './hooks/useVMFilters'
import { useLayout } from '../../contexts/LayoutContext'

const VirtualMachines = () => {
  const { setRefreshHandler, setIsLoading } = useLayout()

  // Virtual Machines
  const {
    vms,
    loading,
    startingVMs,
    stoppingVMs,
    suspendingVMs,
    resumingVMs,
    error,
    loadVMs,
    startVM,
    stopVM,
    suspendVM,
    connectVM,
  } = useVirtualMachines()

  // Filters
  const {
    statusFilter,
    selectedTags,
    spiceOnly,
    uniqueTags,
    filteredVMs,
    setStatusFilter,
    toggleTag,
    clearTags,
    setSpiceOnly,
    clearFilters,
  } = useVMFilters(vms)

  // Set refresh handler and loading state
  useEffect(() => {
    setRefreshHandler(loadVMs)
  }, [loadVMs, setRefreshHandler])

  useEffect(() => {
    setIsLoading(loading)
  }, [loading, setIsLoading])

  // Load VMs on mount
  useEffect(() => {
    loadVMs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-4 pb-4">
      {error && <Alert type="error" message={error} />}

      <VMFilter
        statusFilter={statusFilter}
        selectedTags={selectedTags}
        spiceOnly={spiceOnly}
        uniqueTags={uniqueTags}
        onStatusFilterChange={setStatusFilter}
        onToggleTag={toggleTag}
        onClearTags={clearTags}
        onSpiceOnlyChange={setSpiceOnly}
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
  )
}

export default VirtualMachines
