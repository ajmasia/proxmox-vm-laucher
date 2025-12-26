import { useState, useCallback, useMemo, ReactNode } from 'react'
import { LayoutContext, LayoutContextType, VMFilterProps } from './LayoutContext'

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [onRefresh, setOnRefresh] = useState<(() => void) | null>(null)
  const [isLoading, setIsLoadingState] = useState(false)
  const [filterProps, setFilterPropsState] = useState<VMFilterProps | null>(null)
  const [filterSlot, setFilterSlotState] = useState<ReactNode>(null)

  // Memoize all callbacks to prevent unnecessary re-renders
  const setRefreshHandler = useCallback((handler: () => void) => {
    setOnRefresh(() => handler)
  }, [])

  const setIsLoading = useCallback((loading: boolean) => {
    setIsLoadingState(loading)
  }, [])

  const setFilterProps = useCallback((props: VMFilterProps | null) => {
    setFilterPropsState(props)
  }, [])

  const setFilterSlot = useCallback((slot: ReactNode) => {
    setFilterSlotState(slot)
  }, [])

  // Memoize the context value to prevent unnecessary re-renders
  const value: LayoutContextType = useMemo(
    () => ({
      onRefresh,
      isLoading,
      setRefreshHandler,
      setIsLoading,
      filterProps,
      setFilterProps,
      filterSlot,
      setFilterSlot,
    }),
    [
      onRefresh,
      isLoading,
      filterProps,
      filterSlot,
      setRefreshHandler,
      setIsLoading,
      setFilterProps,
      setFilterSlot,
    ]
  )

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
}
