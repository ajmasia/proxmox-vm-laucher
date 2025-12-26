import { useEffect, useRef } from 'react'
import VMList from './components/VMList/VMList'
import VMFilter from './components/VMFilter/VMFilter'
import { useVirtualMachines } from './hooks/useVirtualMachines'
import { useVMFilters } from './hooks/useVMFilters'
import { useLayout } from '../../contexts/LayoutContext'

const VirtualMachines = () => {
  const { setRefreshHandler, setIsLoading, setFilterSlot } = useLayout()
  const isInitialized = useRef(false)

  // Virtual Machines
  const {
    vms,
    loading,
    startingVMs,
    stoppingVMs,
    suspendingVMs,
    resumingVMs,
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

  // Initialize once on mount
  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true

    setRefreshHandler(loadVMs)
    loadVMs()
  }, [loadVMs, setRefreshHandler])

  // Update loading state only when it changes
  const prevLoadingRef = useRef(loading)
  useEffect(() => {
    if (prevLoadingRef.current !== loading) {
      prevLoadingRef.current = loading
      setIsLoading(loading)
    }
  }, [loading, setIsLoading])

  // Set filter slot once on mount, update only when filter values change
  useEffect(() => {
    setFilterSlot(
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
    )
  }, [
    statusFilter,
    selectedTags,
    spiceOnly,
    uniqueTags,
    setStatusFilter,
    toggleTag,
    clearTags,
    setSpiceOnly,
    clearFilters,
    setFilterSlot,
  ])

  return (
    <div className="space-y-4 pb-4">
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
