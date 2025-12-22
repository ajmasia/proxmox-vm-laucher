import type { ProxmoxVM } from '../types/proxmox'

interface VMListProps {
  vms: ProxmoxVM[]
  onSelectVM: (vm: ProxmoxVM) => void
  loading?: boolean
}

export default function VMList({ vms, onSelectVM, loading }: VMListProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800'
      case 'stopped':
        return 'bg-red-100 text-red-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-lg border border-slate-200 p-4">
            <div className="h-4 w-1/3 rounded bg-slate-200"></div>
            <div className="mt-2 h-3 w-1/2 rounded bg-slate-200"></div>
          </div>
        ))}
      </div>
    )
  }

  if (vms.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 p-8 text-center">
        <p className="text-slate-600">No virtual machines found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {vms.map((vm) => (
        <button
          key={vm.vmid}
          onClick={() => onSelectVM(vm)}
          className="w-full rounded-lg border border-slate-200 p-4 text-left transition-all hover:border-blue-500 hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-slate-900">{vm.name}</h3>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(vm.status)}`}
                >
                  {vm.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                VM ID: {vm.vmid} • Node: {vm.node}
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-600">CPU:</span>
              <span className="ml-1 font-medium text-slate-900">{vm.cpus || 0} cores</span>
            </div>
            <div>
              <span className="text-slate-600">Memory:</span>
              <span className="ml-1 font-medium text-slate-900">
                {formatBytes(vm.mem || 0)} / {formatBytes(vm.maxmem || 0)}
              </span>
            </div>
            <div>
              <span className="text-slate-600">Disk:</span>
              <span className="ml-1 font-medium text-slate-900">
                {formatBytes(vm.disk || 0)} / {formatBytes(vm.maxdisk || 0)}
              </span>
            </div>
            {vm.uptime && vm.uptime > 0 && (
              <div>
                <span className="text-slate-600">Uptime:</span>
                <span className="ml-1 font-medium text-slate-900">
                  {Math.floor(vm.uptime / 3600)}h {Math.floor((vm.uptime % 3600) / 60)}m
                </span>
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
