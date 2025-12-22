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

  const vms = Array.from(vmMap.values())

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
