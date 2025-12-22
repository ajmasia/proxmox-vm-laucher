import { memo } from 'react'
import type { ProxmoxVM } from '../../../../types/proxmox'
import { PlayIcon, StopIcon, PauseIcon, ResumeIcon, MonitorIcon, SpinnerIcon } from '../../../../icons'
import { formatBytes, getStatusColor, getStatusDot } from './utils'

interface VMItemProps {
  vm: ProxmoxVM
  onStartVM: (vm: ProxmoxVM) => void
  onStopVM: (vm: ProxmoxVM) => void
  onSuspendVM: (vm: ProxmoxVM) => void
  onConnectVM: (vm: ProxmoxVM) => void
  isStarting: boolean
  isStopping: boolean
  isSuspending: boolean
  isResuming: boolean
}

const VMItem = memo(function VMItem({
  vm,
  onStartVM,
  onStopVM,
  onSuspendVM,
  onConnectVM,
  isStarting,
  isStopping,
  isSuspending,
  isResuming,
}: VMItemProps) {
  return (
    <div className="group overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md">
      <div className="flex items-center gap-4 p-4">
        {/* VM Icon and Name */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <MonitorIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-slate-900 truncate">{vm.name}</div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-sm text-slate-500">ID: {vm.vmid}</div>
              {vm.tags && vm.tags.trim() && (
                <>
                  <span className="text-slate-300">•</span>
                  <div className="flex flex-wrap gap-1">
                    {vm.tags.split(';').filter(tag => tag.trim()).map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-600/10"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex-shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusColor(vm.status)}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(vm.status)}`}></span>
            {vm.status}
          </span>
        </div>

        {/* Resources */}
        <div className="flex-shrink-0 text-right">
          <div className="text-sm text-slate-900">{vm.cpus || 0} vCPU</div>
          <div className="text-xs text-slate-500">
            {formatBytes(vm.mem || 0)} / {formatBytes(vm.maxmem || 0)}
          </div>
        </div>

        {/* Node */}
        <div className="flex-shrink-0 text-sm text-slate-600 min-w-[80px]">
          {vm.node}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 min-w-[180px] min-h-[40px] flex items-center justify-end">
          {isStarting ? (
            <div className="inline-flex items-center gap-2 text-emerald-600">
              <SpinnerIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Starting...</span>
            </div>
          ) : isResuming ? (
            <div className="inline-flex items-center gap-2 text-emerald-600">
              <SpinnerIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Resuming...</span>
            </div>
          ) : isStopping ? (
            <div className="inline-flex items-center gap-2 text-slate-600">
              <SpinnerIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Stopping...</span>
            </div>
          ) : isSuspending ? (
            <div className="inline-flex items-center gap-2 text-amber-600">
              <SpinnerIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Pausing...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {vm.status === 'stopped' && (
                <button
                  onClick={() => onStartVM(vm)}
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-600 p-2 text-white transition-all hover:bg-emerald-700"
                  title="Start VM"
                >
                  <PlayIcon className="h-4 w-4" />
                </button>
              )}

              {vm.status === 'running' && (
                <>
                  <button
                    onClick={() => onConnectVM(vm)}
                    className="inline-flex items-center justify-center rounded-lg bg-purple-600 p-2 text-white transition-all hover:bg-purple-700"
                    title="Connect via SPICE"
                  >
                    <MonitorIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onSuspendVM(vm)}
                    className="inline-flex items-center justify-center rounded-lg bg-amber-600 p-2 text-white transition-all hover:bg-amber-700"
                    title="Pause VM"
                  >
                    <PauseIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onStopVM(vm)}
                    className="inline-flex items-center justify-center rounded-lg bg-red-600 p-2 text-white transition-all hover:bg-red-700"
                    title="Stop VM"
                  >
                    <StopIcon className="h-4 w-4" />
                  </button>
                </>
              )}

              {vm.status === 'paused' && (
                <>
                  <button
                    onClick={() => onStartVM(vm)}
                    className="inline-flex items-center justify-center rounded-lg bg-emerald-600 p-2 text-white transition-all hover:bg-emerald-700"
                    title="Resume VM"
                  >
                    <ResumeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onStopVM(vm)}
                    className="inline-flex items-center justify-center rounded-lg bg-red-600 p-2 text-white transition-all hover:bg-red-700"
                    title="Stop VM"
                  >
                    <StopIcon className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Only re-render if relevant props actually changed
  return (
    prevProps.vm.vmid === nextProps.vm.vmid &&
    prevProps.vm.name === nextProps.vm.name &&
    prevProps.vm.status === nextProps.vm.status &&
    prevProps.vm.cpus === nextProps.vm.cpus &&
    prevProps.vm.mem === nextProps.vm.mem &&
    prevProps.vm.maxmem === nextProps.vm.maxmem &&
    prevProps.vm.node === nextProps.vm.node &&
    prevProps.vm.tags === nextProps.vm.tags &&
    prevProps.isStarting === nextProps.isStarting &&
    prevProps.isStopping === nextProps.isStopping &&
    prevProps.isSuspending === nextProps.isSuspending &&
    prevProps.isResuming === nextProps.isResuming
  )
})

export default VMItem
