import { useState, ReactNode } from 'react'
import { LayoutContext, LayoutContextType, VMFilterProps } from './LayoutContext'

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [onRefresh, setOnRefresh] = useState<(() => void) | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [filterProps, setFilterProps] = useState<VMFilterProps | null>(null)
  const [filterSlot, setFilterSlot] = useState<ReactNode>(null)

  const setRefreshHandler = (handler: () => void) => {
    setOnRefresh(() => handler)
  }

  const value: LayoutContextType = {
    onRefresh,
    isLoading,
    setRefreshHandler,
    setIsLoading,
    filterProps,
    setFilterProps,
    filterSlot,
    setFilterSlot,
  }

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
}
