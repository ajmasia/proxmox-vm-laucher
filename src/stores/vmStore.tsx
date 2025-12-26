import { create } from 'zustand'
import { toast } from 'sonner'
import type { ProxmoxVM } from '../types/proxmox'
import { useAuthStore } from './authStore'

interface TaskStatus {
  status: string
  exitstatus?: string // Proxmox uses lowercase
}

const TASK_POLL_INTERVAL = 2000
const TASK_POLL_TIMEOUT = 120000

type VMRecord = Record<number, ProxmoxVM>

interface VMStore {
  vms: VMRecord
  loadingVMs: boolean
  startingVMs: Set<number>
  stoppingVMs: Set<number>
  suspendingVMs: Set<number>
  resumingVMs: Set<number>
  error: string | null

  setError: (error: string | null) => void
  loadVMs: () => Promise<void>
  refreshSingleVM: (vmid: number) => Promise<void>
  startVM: (vm: ProxmoxVM) => Promise<void>
  stopVM: (vm: ProxmoxVM) => Promise<void>
  suspendVM: (vm: ProxmoxVM) => Promise<void>
  connectVM: (vm: ProxmoxVM) => Promise<void>
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const MIN_LOADING_TIME = 600

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

  while (true) {
    if (Date.now() - startTime > TASK_POLL_TIMEOUT) {
      onError('Task timed out')
      return
    }

    try {
      const status = (await window.electronAPI.getTaskStatus({
        host: session.server.host,
        port: session.server.port,
        ticket: session.ticket,
        node,
        upid,
      })) as TaskStatus

      if (status.status === 'stopped') {
        if (status.exitstatus && status.exitstatus !== 'OK') {
          onError(`Task failed: ${status.exitstatus}`)
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

  const stateChangeTimeout = 15000
  const stateChangeStart = Date.now()

  while (Date.now() - stateChangeStart < stateChangeTimeout) {
    try {
      const vmList = await window.electronAPI.listVMs({
        host: session.server.host,
        port: session.server.port,
        ticket: session.ticket,
      })
      const vm = vmList.find((v: ProxmoxVM) => v.vmid === vmid)

      if (vm && vm.status !== originalStatus) {
        await onComplete()
        return
      }

      await delay(1000)
    } catch (err) {
      console.error('Error polling VM status:', err)
    }
  }

  await onComplete()
}

const arrayToRecord = (vmList: ProxmoxVM[]): VMRecord => {
  const record: VMRecord = {}
  for (const vm of vmList) {
    record[vm.vmid] = vm
  }
  return record
}

export const useVMStore = create<VMStore>((set, get) => ({
  vms: {},
  loadingVMs: false,
  startingVMs: new Set(),
  stoppingVMs: new Set(),
  suspendingVMs: new Set(),
  resumingVMs: new Set(),
  error: null,

  setError: (error) => set({ error }),

  loadVMs: async () => {
    set({ loadingVMs: true, error: null })

    try {
      const session = useAuthStore.getState().session
      if (!session) {
        throw new Error('No active session')
      }

      const [vmList] = await Promise.all([
        window.electronAPI.listVMs({
          host: session.server.host,
          port: session.server.port,
          ticket: session.ticket,
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

      const vmList = await window.electronAPI.listVMs({
        host: session.server.host,
        port: session.server.port,
        ticket: session.ticket,
      })
      const updatedVM = vmList.find((vm: ProxmoxVM) => vm.vmid === vmid)

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

    // If VM is paused, resume instead of start
    if (vm.status === 'paused') {
      return get().suspendVM(vm)
    }

    set((state) => ({
      startingVMs: new Set(state.startingVMs).add(vm.vmid),
    }))

    try {
      const upid = await window.electronAPI.startVM({
        host: session.server.host,
        port: session.server.port,
        ticket: session.ticket,
        csrf: session.csrfToken,
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
          toast.success(<>VM <strong>{vm.name}</strong> started</>)
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
      const upid = await window.electronAPI.stopVM({
        host: session.server.host,
        port: session.server.port,
        ticket: session.ticket,
        csrf: session.csrfToken,
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
          toast.success(<>VM <strong>{vm.name}</strong> stopped</>)
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

    // If VM is paused, resume it; otherwise suspend it
    const isPaused = vm.status === 'paused'
    const actionSet = isPaused ? 'resumingVMs' : 'suspendingVMs'
    const apiCall = isPaused ? window.electronAPI.resumeVM : window.electronAPI.suspendVM
    const actionName = isPaused ? 'resume' : 'suspend'
    const pastTense = isPaused ? 'resumed' : 'suspended'

    set((state) => ({
      [actionSet]: new Set(state[actionSet as keyof typeof state] as Set<number>).add(vm.vmid),
    }))

    try {
      const upid = await apiCall({
        host: session.server.host,
        port: session.server.port,
        ticket: session.ticket,
        csrf: session.csrfToken,
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
            const newSet = new Set(state[actionSet as keyof typeof state] as Set<number>)
            newSet.delete(vm.vmid)
            return { [actionSet]: newSet }
          })
          toast.success(<>VM <strong>{vm.name}</strong> {pastTense}</>)
        },
        (error) => {
          toast.error(`Failed to ${actionName} VM: ${error}`)
          set((state) => {
            const newSet = new Set(state[actionSet as keyof typeof state] as Set<number>)
            newSet.delete(vm.vmid)
            return { [actionSet]: newSet }
          })
        }
      )
    } catch (err) {
      toast.error(`Failed to ${actionName} VM: ${err}`)
      set((state) => {
        const newSet = new Set(state[actionSet as keyof typeof state] as Set<number>)
        newSet.delete(vm.vmid)
        return { [actionSet]: newSet }
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

      await window.electronAPI.connectSPICE({
        host: session.server.host,
        port: session.server.port,
        ticket: session.ticket,
        csrf: session.csrfToken,
        node: vm.node,
        vmid: vm.vmid,
      })
      toast.success(<>Connected to <strong>{vm.name}</strong></>)
    } catch (err) {
      toast.error(`Failed to connect to VM: ${err}`)
    }
  },
}))
