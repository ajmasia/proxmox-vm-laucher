import { memo } from 'react'
import type { ProxmoxVM } from '../../../../types/proxmox'
import VMItem from '../VMItem/VMItem'

interface VMListProps {
  vms: ProxmoxVM[]
  onStartVM: (vm: ProxmoxVM) => void
  onStopVM: (vm: ProxmoxVM) => void
  onSuspendVM: (vm: ProxmoxVM) => void
  onConnectVM: (vm: ProxmoxVM) => void
  loading?: boolean
  startingVMs: Set<number>
  stoppingVMs: Set<number>
  suspendingVMs: Set<number>
  resumingVMs: Set<number>
}

const LoadingSkeleton = memo(function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5"
        >
          <div className="h-5 w-1/3 rounded bg-slate-200"></div>
          <div className="mt-3 h-4 w-1/2 rounded bg-slate-200"></div>
        </div>
      ))}
    </div>
  )
})

const EmptyState = memo(function EmptyState() {
  return (
    <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-black/5">
      <p className="text-slate-500">No virtual machines found</p>
    </div>
  )
})

const VMList = memo(function VMList({
  vms,
  onStartVM,
  onStopVM,
  onSuspendVM,
  onConnectVM,
  loading,
  startingVMs,
  stoppingVMs,
  suspendingVMs,
  resumingVMs,
}: VMListProps) {
  if (loading) {
    return <LoadingSkeleton />
  }

  if (vms.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="space-y-3">
      {vms.map((vm) => (
        <VMItem
          key={vm.vmid}
          vm={vm}
          onStartVM={onStartVM}
          onStopVM={onStopVM}
          onSuspendVM={onSuspendVM}
          onConnectVM={onConnectVM}
          isStarting={startingVMs.has(vm.vmid)}
          isStopping={stoppingVMs.has(vm.vmid)}
          isSuspending={suspendingVMs.has(vm.vmid)}
          isResuming={resumingVMs.has(vm.vmid)}
        />
      ))}
    </div>
  )
})

export default VMList
