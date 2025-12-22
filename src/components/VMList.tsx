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
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
              VM ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
              Node
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
              CPU
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
              Memory
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {vms.map((vm) => (
            <tr key={vm.vmid} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                {vm.name}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(vm.status)}`}
                >
                  {vm.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{vm.vmid}</td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{vm.node}</td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                {vm.cpus || 0} cores
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                {formatBytes(vm.mem || 0)} / {formatBytes(vm.maxmem || 0)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm">
                <button
                  onClick={() => onSelectVM(vm)}
                  className="rounded bg-blue-600 px-3 py-1 text-white transition-colors hover:bg-blue-700"
                >
                  Connect
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
