import { useMemo } from 'react'
import { useFilterStore } from '../../../stores/filterStore'
import type { ProxmoxVM } from '../../../types/proxmox'

export const useVMFilters = (vms: ProxmoxVM[]) => {
  const {
    statusFilter,
    tagFilter,
    setStatusFilter,
    setTagFilter,
    clearFilters,
    getUniqueTags,
    getFilteredVMs,
  } = useFilterStore()

  const uniqueTags = useMemo(() => getUniqueTags(vms), [vms, getUniqueTags])
  const filteredVMs = useMemo(() => getFilteredVMs(vms), [vms, statusFilter, tagFilter, getFilteredVMs])

  return {
    statusFilter,
    tagFilter,
    uniqueTags,
    filteredVMs,
    setStatusFilter,
    setTagFilter,
    clearFilters,
  }
}
