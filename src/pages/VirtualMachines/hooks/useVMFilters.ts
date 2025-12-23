import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useFilterStore, getUniqueTags, getFilteredVMs } from '../../../stores/filterStore'
import type { ProxmoxVM } from '../../../types/proxmox'

export const useVMFilters = (vms: ProxmoxVM[]) => {
  // Use shallow comparison for state values
  const { statusFilter, selectedTags, spiceOnly } = useFilterStore(
    useShallow((state) => ({
      statusFilter: state.statusFilter,
      selectedTags: state.selectedTags,
      spiceOnly: state.spiceOnly,
    }))
  )

  // Get stable action references
  const setStatusFilter = useFilterStore((state) => state.setStatusFilter)
  const toggleTag = useFilterStore((state) => state.toggleTag)
  const clearTags = useFilterStore((state) => state.clearTags)
  const setSpiceOnly = useFilterStore((state) => state.setSpiceOnly)
  const clearFilters = useFilterStore((state) => state.clearFilters)

  // Now useMemo works correctly with stable function references
  const uniqueTags = useMemo(() => getUniqueTags(vms), [vms])
  const filteredVMs = useMemo(
    () => getFilteredVMs(vms, statusFilter, selectedTags, spiceOnly),
    [vms, statusFilter, selectedTags, spiceOnly]
  )

  return {
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
  }
}
