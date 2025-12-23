import { create } from 'zustand'
import { invoke } from '@tauri-apps/api/core'
import { toast } from 'sonner'
import type { ProxmoxVM } from '../types/proxmox'
import { useAuthStore } from './authStore'

interface TaskStatus {
  status: string
  exitStatus: string
}

const TASK_POLL_INTERVAL = 2000 // Poll every 2 seconds
const TASK_POLL_TIMEOUT = 120000 // Timeout after 2 minutes

// Use Record instead of Map for better React/Zustand compatibility
type VMRecord = Record<number, ProxmoxVM>

interface VMStore {
  // State
  vms: VMRecord
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

// Helper function to wait for a delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Minimum loading time for better UX (shows skeleton briefly)
const MIN_LOADING_TIME = 600

// Helper function to poll task status until completion
async function pollTaskStatus(
  node: string,
  upid: string,
  vmid: number,
  originalStatus: string,
  onComplete: () => Promise<void>,
  onError: (error: string) => void
): Promise<void> {
  const session = useAuthStore.getState().session
  if (!session) {
    onError('No active session')
    return
  }

  const startTime = Date.now()

  // Phase 1: Wait for task to complete
  while (true) {
    if (Date.now() - startTime > TASK_POLL_TIMEOUT) {
      onError('Task timed out')
      return
    }

    try {
      const status = await invoke<TaskStatus>('get_task_status_with_session', {
        host: session.server.host,
        port: session.server.port,
        username: session.username,
        password: session.ticket,
        node,
        upid,
      })

      if (status.status === 'stopped') {
        if (status.exitStatus !== 'OK') {
          onError(`Task failed: ${status.exitStatus}`)
          return
        }
        break
      }

      await delay(TASK_POLL_INTERVAL)
    } catch (err) {
      onError(`Failed to get task status: ${err}`)
      return
    }
  }

  // Phase 2: Poll until VM status changes from original
  const stateChangeTimeout = 15000 // 15 seconds max wait for state change
  const stateChangeStart = Date.now()

  while (Date.now() - stateChangeStart < stateChangeTimeout) {
    try {
      const vmList = await invoke<ProxmoxVM[]>('list_vms_with_session', {
        host: session.server.host,
        port: session.server.port,
        username: session.username,
        password: session.ticket,
      })
      const vm = vmList.find((v) => v.vmid === vmid)

      if (vm && vm.status !== originalStatus) {
        await onComplete()
        return
      }

      await delay(1000)
    } catch (err) {
      console.error('Error polling VM status:', err)
    }
  }

  // Timeout waiting for state change, call onComplete anyway
  await onComplete()
}

// Helper to convert VM array to Record
const arrayToRecord = (vmList: ProxmoxVM[]): VMRecord => {
  const record: VMRecord = {}
  for (const vm of vmList) {
    record[vm.vmid] = vm
  }
  return record
}

export const useVMStore = create<VMStore>((set, get) => ({
  // Initial state
  vms: {},
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
      const session = useAuthStore.getState().session
      if (!session) {
        throw new Error('No active session')
      }

      // Load VMs with minimum display time for skeleton
      const [vmList] = await Promise.all([
        invoke<ProxmoxVM[]>('list_vms_with_session', {
          host: session.server.host,
          port: session.server.port,
          username: session.username,
          password: session.ticket,
        }),
        delay(MIN_LOADING_TIME),
      ])
      set({ vms: arrayToRecord(vmList) })
    } catch (err) {
      const message = `Failed to load VMs: ${err}`
      set({ error: message })
      toast.error(message)
    } finally {
      set({ loadingVMs: false })
    }
  },

  refreshSingleVM: async (vmid) => {
    try {
      const session = useAuthStore.getState().session
      if (!session) {
        throw new Error('No active session')
      }

      const vmList = await invoke<ProxmoxVM[]>('list_vms_with_session', {
        host: session.server.host,
        port: session.server.port,
        username: session.username,
        password: session.ticket,
      })
      const updatedVM = vmList.find((vm) => vm.vmid === vmid)

      if (updatedVM) {
        set((state) => ({
          vms: { ...state.vms, [vmid]: updatedVM },
        }))
      }
    } catch (err) {
      console.error('Error refreshing single VM:', err)
    }
  },

  startVM: async (vm) => {
    set({ error: null })

    const session = useAuthStore.getState().session
    if (!session) {
      toast.error('No active session')
      return
    }

    // If VM is paused, use resume instead of start
    if (vm.status === 'paused') {
      set((state) => ({
        resumingVMs: new Set(state.resumingVMs).add(vm.vmid),
      }))

      try {
        const upid = await invoke<string>('resume_vm_with_session', {
          host: session.server.host,
          port: session.server.port,
          username: session.username,
          password: session.ticket,
          node: vm.node,
          vmid: vm.vmid,
        })

        await pollTaskStatus(
          vm.node,
          upid,
          vm.vmid,
          vm.status,
          async () => {
            await get().refreshSingleVM(vm.vmid)
            set((state) => {
              const newSet = new Set(state.resumingVMs)
              newSet.delete(vm.vmid)
              return { resumingVMs: newSet }
            })
            toast.success(`VM "${vm.name}" resumed`)
          },
          (error) => {
            toast.error(`Failed to resume VM: ${error}`)
            set((state) => {
              const newSet = new Set(state.resumingVMs)
              newSet.delete(vm.vmid)
              return { resumingVMs: newSet }
            })
          }
        )
      } catch (err) {
        toast.error(`Failed to resume VM: ${err}`)
        set((state) => {
          const newSet = new Set(state.resumingVMs)
          newSet.delete(vm.vmid)
          return { resumingVMs: newSet }
        })
      }
    } else {
      set((state) => ({
        startingVMs: new Set(state.startingVMs).add(vm.vmid),
      }))

      try {
        const upid = await invoke<string>('start_vm_with_session', {
          host: session.server.host,
          port: session.server.port,
          username: session.username,
          password: session.ticket,
          node: vm.node,
          vmid: vm.vmid,
        })

        await pollTaskStatus(
          vm.node,
          upid,
          vm.vmid,
          vm.status,
          async () => {
            await get().refreshSingleVM(vm.vmid)
            set((state) => {
              const newSet = new Set(state.startingVMs)
              newSet.delete(vm.vmid)
              return { startingVMs: newSet }
            })
            toast.success(`VM "${vm.name}" started`)
          },
          (error) => {
            toast.error(`Failed to start VM: ${error}`)
            set((state) => {
              const newSet = new Set(state.startingVMs)
              newSet.delete(vm.vmid)
              return { startingVMs: newSet }
            })
          }
        )
      } catch (err) {
        toast.error(`Failed to start VM: ${err}`)
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

    const session = useAuthStore.getState().session
    if (!session) {
      toast.error('No active session')
      return
    }

    set((state) => ({
      stoppingVMs: new Set(state.stoppingVMs).add(vm.vmid),
    }))

    try {
      const upid = await invoke<string>('stop_vm_with_session', {
        host: session.server.host,
        port: session.server.port,
        username: session.username,
        password: session.ticket,
        node: vm.node,
        vmid: vm.vmid,
      })

      await pollTaskStatus(
        vm.node,
        upid,
        vm.vmid,
        vm.status,
        async () => {
          await get().refreshSingleVM(vm.vmid)
          set((state) => {
            const newSet = new Set(state.stoppingVMs)
            newSet.delete(vm.vmid)
            return { stoppingVMs: newSet }
          })
          toast.success(`VM "${vm.name}" stopped`)
        },
        (error) => {
          toast.error(`Failed to stop VM: ${error}`)
          set((state) => {
            const newSet = new Set(state.stoppingVMs)
            newSet.delete(vm.vmid)
            return { stoppingVMs: newSet }
          })
        }
      )
    } catch (err) {
      toast.error(`Failed to stop VM: ${err}`)
      set((state) => {
        const newSet = new Set(state.stoppingVMs)
        newSet.delete(vm.vmid)
        return { stoppingVMs: newSet }
      })
    }
  },

  suspendVM: async (vm) => {
    set({ error: null })

    const session = useAuthStore.getState().session
    if (!session) {
      toast.error('No active session')
      return
    }

    set((state) => ({
      suspendingVMs: new Set(state.suspendingVMs).add(vm.vmid),
    }))

    try {
      const upid = await invoke<string>('suspend_vm_with_session', {
        host: session.server.host,
        port: session.server.port,
        username: session.username,
        password: session.ticket,
        node: vm.node,
        vmid: vm.vmid,
      })

      await pollTaskStatus(
        vm.node,
        upid,
        vm.vmid,
        vm.status,
        async () => {
          await get().refreshSingleVM(vm.vmid)
          set((state) => {
            const newSet = new Set(state.suspendingVMs)
            newSet.delete(vm.vmid)
            return { suspendingVMs: newSet }
          })
          toast.success(`VM "${vm.name}" paused`)
        },
        (error) => {
          toast.error(`Failed to pause VM: ${error}`)
          set((state) => {
            const newSet = new Set(state.suspendingVMs)
            newSet.delete(vm.vmid)
            return { suspendingVMs: newSet }
          })
        }
      )
    } catch (err) {
      toast.error(`Failed to pause VM: ${err}`)
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
      const session = useAuthStore.getState().session
      if (!session) {
        toast.error('No active session')
        return
      }

      await invoke('connect_to_proxmox_with_session', {
        host: session.server.host,
        port: session.server.port,
        username: session.username,
        password: session.ticket,
        node: vm.node,
        vmid: vm.vmid,
      })
      toast.success(`Connected to "${vm.name}"`)
    } catch (err) {
      toast.error(`Failed to connect to VM: ${err}`)
    }
  },
}))
