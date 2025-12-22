import { createContext, useContext } from 'react'

export interface LayoutContextType {
  onRefresh: (() => void) | null
  isLoading: boolean
  setRefreshHandler: (handler: () => void) => void
  setIsLoading: (loading: boolean) => void
}

export const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

export const useLayout = () => {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayout must be used within LayoutProvider')
  }
  return context
}
