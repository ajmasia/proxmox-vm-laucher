import { useMemo } from 'react'
import { useFilterStore } from '../../../stores/filterStore'
import type { ProxmoxVM } from '../../../types/proxmox'

export const useVMFilters = (vms: ProxmoxVM[]) => {
  const {
    statusFilter,
    selectedTags,
    spiceOnly,
    setStatusFilter,
    toggleTag,
    clearTags,
    setSpiceOnly,
    clearFilters,
    getUniqueTags,
    getFilteredVMs,
  } = useFilterStore()

  const uniqueTags = useMemo(() => getUniqueTags(vms), [vms, getUniqueTags])
  const filteredVMs = useMemo(() => getFilteredVMs(vms), [vms, getFilteredVMs])

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
