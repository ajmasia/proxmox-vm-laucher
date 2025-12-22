import { useState, ReactNode } from 'react'
import { LayoutContext, LayoutContextType } from './LayoutContext'

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [onRefresh, setOnRefresh] = useState<(() => void) | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const setRefreshHandler = (handler: () => void) => {
    setOnRefresh(() => handler)
  }

  const value: LayoutContextType = {
    onRefresh,
    isLoading,
    setRefreshHandler,
    setIsLoading,
  }

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
}
