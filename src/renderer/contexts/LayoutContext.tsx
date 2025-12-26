import { createContext, useContext, ReactNode } from 'react'

export interface VMFilterProps {
  statusFilter: string
  selectedTags: string[]
  spiceOnly: boolean
  uniqueTags: string[]
  onStatusFilterChange: (value: string) => void
  onToggleTag: (tag: string) => void
  onClearTags: () => void
  onSpiceOnlyChange: (enabled: boolean) => void
  onClearFilters: () => void
}

export interface LayoutContextType {
  onRefresh: (() => void) | null
  isLoading: boolean
  setRefreshHandler: (handler: () => void) => void
  setIsLoading: (loading: boolean) => void
  filterProps: VMFilterProps | null
  setFilterProps: (props: VMFilterProps | null) => void
  filterSlot: ReactNode
  setFilterSlot: (slot: ReactNode) => void
}

export const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

export const useLayout = () => {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayout must be used within LayoutProvider')
  }
  return context
}
