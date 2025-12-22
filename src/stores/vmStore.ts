import { create } from 'zustand'
import { invoke } from '@tauri-apps/api/core'
import type { ProxmoxVM } from '../types/proxmox'

interface VMStore {
  // State
  vmMap: Map<number, ProxmoxVM>
  loadingVMs: boolean
  startingVMs: Set<number>
  stoppingVMs: Set<number>
  suspendingVMs: Set<number>
  resumingVMs: Set<number>
  error: string | null

  // Actions
  setError: (error: string | null) => void
  loadVMs: () => Promise<void>
  refreshSingleVM: (vmid: number) => Promise<void>
  startVM: (vm: ProxmoxVM) => Promise<void>
  stopVM: (vm: ProxmoxVM) => Promise<void>
  suspendVM: (vm: ProxmoxVM) => Promise<void>
  connectVM: (vm: ProxmoxVM) => Promise<void>
}

export const useVMStore = create<VMStore>((set, get) => ({
  // Initial state
  vmMap: new Map(),
  loadingVMs: false,
  startingVMs: new Set(),
  stoppingVMs: new Set(),
  suspendingVMs: new Set(),
  resumingVMs: new Set(),
  error: null,


  // Actions
  setError: (error) => set({ error }),

  loadVMs: async () => {
    set({ loadingVMs: true, error: null })

    try {
      const vmList = await invoke<ProxmoxVM[]>('list_vms')
      set({ vmMap: new Map(vmList.map(vm => [vm.vmid, vm])) })
    } catch (err) {
      set({ error: err as string })
      console.error('Error loading VMs:', err)
    } finally {
      set({ loadingVMs: false })
    }
  },

  refreshSingleVM: async (vmid) => {
    try {
      const vmList = await invoke<ProxmoxVM[]>('list_vms')
      const updatedVM = vmList.find(vm => vm.vmid === vmid)

      if (updatedVM) {
        set((state) => {
          const newMap = new Map(state.vmMap)
          newMap.set(vmid, updatedVM)
          return { vmMap: newMap }
        })
      }
    } catch (err) {
      console.error('Error refreshing single VM:', err)
    }
  },

  startVM: async (vm) => {
    set({ error: null })

    // If VM is paused, use resume instead of start
    if (vm.status === 'paused') {
      set((state) => ({
        resumingVMs: new Set(state.resumingVMs).add(vm.vmid)
      }))

      try {
        await invoke('resume_vm', { node: vm.node, vmid: vm.vmid })

        setTimeout(async () => {
          await get().refreshSingleVM(vm.vmid)
          set((state) => {
            const newSet = new Set(state.resumingVMs)
            newSet.delete(vm.vmid)
            return { resumingVMs: newSet }
          })
        }, 5000)
      } catch (err) {
        set({ error: `Failed to resume VM: ${err}` })
        set((state) => {
          const newSet = new Set(state.resumingVMs)
          newSet.delete(vm.vmid)
          return { resumingVMs: newSet }
        })
      }
    } else {
      set((state) => ({
        startingVMs: new Set(state.startingVMs).add(vm.vmid)
      }))

      try {
        await invoke('start_vm', { node: vm.node, vmid: vm.vmid })

        setTimeout(async () => {
          await get().refreshSingleVM(vm.vmid)
          set((state) => {
            const newSet = new Set(state.startingVMs)
            newSet.delete(vm.vmid)
            return { startingVMs: newSet }
          })
        }, 30000)
      } catch (err) {
        set({ error: `Failed to start VM: ${err}` })
        set((state) => {
          const newSet = new Set(state.startingVMs)
          newSet.delete(vm.vmid)
          return { startingVMs: newSet }
        })
      }
    }
  },

  stopVM: async (vm) => {
    set({ error: null })
    set((state) => ({
      stoppingVMs: new Set(state.stoppingVMs).add(vm.vmid)
    }))

    try {
      await invoke('stop_vm', { node: vm.node, vmid: vm.vmid })

      setTimeout(async () => {
        await get().refreshSingleVM(vm.vmid)
        set((state) => {
          const newSet = new Set(state.stoppingVMs)
          newSet.delete(vm.vmid)
          return { stoppingVMs: newSet }
        })
      }, 5000)
    } catch (err) {
      set({ error: `Failed to stop VM: ${err}` })
      console.error('Error stopping VM:', err)
      set((state) => {
        const newSet = new Set(state.stoppingVMs)
        newSet.delete(vm.vmid)
        return { stoppingVMs: newSet }
      })
    }
  },

  suspendVM: async (vm) => {
    set({ error: null })
    set((state) => ({
      suspendingVMs: new Set(state.suspendingVMs).add(vm.vmid)
    }))

    try {
      await invoke('suspend_vm', { node: vm.node, vmid: vm.vmid })

      setTimeout(async () => {
        await get().refreshSingleVM(vm.vmid)
        set((state) => {
          const newSet = new Set(state.suspendingVMs)
          newSet.delete(vm.vmid)
          return { suspendingVMs: newSet }
        })
      }, 5000)
    } catch (err) {
      set({ error: `Failed to suspend VM: ${err}` })
      console.error('Error suspending VM:', err)
      set((state) => {
        const newSet = new Set(state.suspendingVMs)
        newSet.delete(vm.vmid)
        return { suspendingVMs: newSet }
      })
    }
  },

  connectVM: async (vm) => {
    set({ error: null })

    try {
      await invoke('connect_to_proxmox', { node: vm.node, vmid: vm.vmid })
      console.log('SPICE viewer launched successfully')
    } catch (err) {
      set({ error: `Failed to connect to VM: ${err}` })
      console.error('Error connecting to VM:', err)
    }
  },
}))
