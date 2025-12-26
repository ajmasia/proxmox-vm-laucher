import { useMemo } from 'react'
import { useVMStore } from '../../../stores/vmStore'

export const useVirtualMachines = () => {
  // Subscribe to vms Record
  const vmsRecord = useVMStore((state) => state.vms)

  // Subscribe to other state with individual selectors for stability
  const loadingVMs = useVMStore((state) => state.loadingVMs)
  const startingVMs = useVMStore((state) => state.startingVMs)
  const stoppingVMs = useVMStore((state) => state.stoppingVMs)
  const suspendingVMs = useVMStore((state) => state.suspendingVMs)
  const resumingVMs = useVMStore((state) => state.resumingVMs)
  const error = useVMStore((state) => state.error)

  // Get stable action references (these don't change)
  const loadVMs = useVMStore((state) => state.loadVMs)
  const startVM = useVMStore((state) => state.startVM)
  const stopVM = useVMStore((state) => state.stopVM)
  const suspendVM = useVMStore((state) => state.suspendVM)
  const connectVM = useVMStore((state) => state.connectVM)

  // Convert Record to array
  const vms = useMemo(() => Object.values(vmsRecord), [vmsRecord])

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
