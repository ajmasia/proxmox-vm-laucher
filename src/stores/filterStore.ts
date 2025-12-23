import { create } from 'zustand'
import type { ProxmoxVM } from '../types/proxmox'

interface FilterStore {
  // State
  statusFilter: string
  selectedTags: string[]
  spiceOnly: boolean

  // Actions
  setStatusFilter: (filter: string) => void
  toggleTag: (tag: string) => void
  clearTags: () => void
  setSpiceOnly: (enabled: boolean) => void
  clearFilters: () => void

  // Computed helpers
  getUniqueTags: (vms: ProxmoxVM[]) => string[]
  getFilteredVMs: (vms: ProxmoxVM[]) => ProxmoxVM[]
}

export const useFilterStore = create<FilterStore>((set, get) => ({
  // Initial state
  statusFilter: 'all',
  selectedTags: [],
  spiceOnly: true,

  // Actions
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  toggleTag: (tag) =>
    set((state) => {
      const newSelectedTags = state.selectedTags.includes(tag)
        ? state.selectedTags.filter((t) => t !== tag)
        : [...state.selectedTags, tag]

      return {
        selectedTags: newSelectedTags,
        spiceOnly: newSelectedTags.length > 0 ? false : state.spiceOnly,
      }
    }),
  clearTags: () => set({ selectedTags: [] }),
  setSpiceOnly: (enabled) =>
    set((state) => ({
      spiceOnly: enabled,
      selectedTags: enabled ? [] : state.selectedTags,
    })),
  clearFilters: () => set({ statusFilter: 'all', selectedTags: [], spiceOnly: true }),

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
    const { statusFilter, selectedTags, spiceOnly } = get()

    return vms.filter((vm) => {
      const statusMatch = statusFilter === 'all' || vm.status === statusFilter

      // If no tags selected, show all
      const tagMatch =
        selectedTags.length === 0 ||
        (vm.tags &&
          selectedTags.some((selectedTag) =>
            vm.tags!
              .split(';')
              .map((tag) => tag.trim())
              .includes(selectedTag)
          ))

      const spiceMatch = !spiceOnly || vm.spice === true
      return statusMatch && tagMatch && spiceMatch
    })
  },
}))
