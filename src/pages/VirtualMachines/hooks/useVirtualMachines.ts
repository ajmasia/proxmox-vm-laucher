import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useVMStore } from '../../../stores/vmStore'

export const useVirtualMachines = () => {
  // Use shallow comparison to prevent unnecessary re-renders
  const {
    vmMap,
    loadingVMs,
    startingVMs,
    stoppingVMs,
    suspendingVMs,
    resumingVMs,
    error,
  } = useVMStore(
    useShallow((state) => ({
      vmMap: state.vmMap,
      loadingVMs: state.loadingVMs,
      startingVMs: state.startingVMs,
      stoppingVMs: state.stoppingVMs,
      suspendingVMs: state.suspendingVMs,
      resumingVMs: state.resumingVMs,
      error: state.error,
    }))
  )

  // Get stable action references (these don't change)
  const loadVMs = useVMStore((state) => state.loadVMs)
  const startVM = useVMStore((state) => state.startVM)
  const stopVM = useVMStore((state) => state.stopVM)
  const suspendVM = useVMStore((state) => state.suspendVM)
  const connectVM = useVMStore((state) => state.connectVM)

  // Memoize the VMs array to prevent recreation on every render
  const vms = useMemo(() => Array.from(vmMap.values()), [vmMap])

  return {
    vms,
    loading: loadingVMs,
    startingVMs,
    stoppingVMs,
    suspendingVMs,
    resumingVMs,
    error,
    loadVMs,
    startVM,
    stopVM,
    suspendVM,
    connectVM,
  }
}
