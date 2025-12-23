import { create } from 'zustand'
import type { ProxmoxVM } from '../types/proxmox'

interface FilterState {
  statusFilter: string
  selectedTags: string[]
  spiceOnly: boolean
}

interface FilterStore extends FilterState {
  // Actions
  setStatusFilter: (filter: string) => void
  toggleTag: (tag: string) => void
  clearTags: () => void
  setSpiceOnly: (enabled: boolean) => void
  clearFilters: () => void
}

// Pure functions outside the store for stable references
export const getUniqueTags = (vms: ProxmoxVM[]): string[] => {
  return Array.from(
    new Set(
      vms
        .filter((vm) => vm.tags && vm.tags.trim())
        .flatMap((vm) => vm.tags!.split(';').map((tag) => tag.trim()))
        .filter((tag) => tag)
    )
  ).sort()
}

export const getFilteredVMs = (
  vms: ProxmoxVM[],
  statusFilter: string,
  selectedTags: string[],
  spiceOnly: boolean
): ProxmoxVM[] => {
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
}

export const useFilterStore = create<FilterStore>((set) => ({
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
}))
