import { useMemo } from 'react'
import { useVMStore } from '../../../stores/vmStore'

export const useVirtualMachines = () => {
  const {
    vmMap,
    loadingVMs,
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
  } = useVMStore()

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
