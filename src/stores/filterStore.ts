import { create } from 'zustand'
import type { ProxmoxVM } from '../types/proxmox'

interface FilterStore {
  // State
  statusFilter: string
  tagFilter: string

  // Actions
  setStatusFilter: (filter: string) => void
  setTagFilter: (filter: string) => void
  clearFilters: () => void

  // Computed helpers
  getUniqueTags: (vms: ProxmoxVM[]) => string[]
  getFilteredVMs: (vms: ProxmoxVM[]) => ProxmoxVM[]
}

export const useFilterStore = create<FilterStore>((set, get) => ({
  // Initial state
  statusFilter: 'all',
  tagFilter: 'all',

  // Actions
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setTagFilter: (filter) => set({ tagFilter: filter }),
  clearFilters: () => set({ statusFilter: 'all', tagFilter: 'all' }),

  // Computed helpers
  getUniqueTags: (vms) => {
    return Array.from(
      new Set(
        vms
          .filter((vm) => vm.tags && vm.tags.trim())
          .flatMap((vm) => vm.tags!.split(';').map((tag) => tag.trim()))
          .filter((tag) => tag)
      )
    ).sort()
  },

  getFilteredVMs: (vms) => {
    const { statusFilter, tagFilter } = get()

    return vms.filter((vm) => {
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
  },
}))
