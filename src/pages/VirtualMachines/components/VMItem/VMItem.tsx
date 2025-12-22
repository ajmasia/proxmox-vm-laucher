import { memo } from 'react'
import type { ProxmoxVM } from '../../../../types/proxmox'
import { PlayIcon, StopIcon, PauseIcon, ResumeIcon, MonitorIcon, PlugIcon, SpinnerIcon } from '../../../../icons'
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
                        className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-600/10"
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
        <div className="flex-shrink-0 min-w-[90px] flex justify-center">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusColor(vm.status)}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(vm.status)}`}></span>
            {vm.status}
          </span>
        </div>

        {/* Resources */}
        <div className="flex-shrink-0 text-right min-w-[140px]">
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
          {(isStarting || isResuming || isStopping || isSuspending) ? (
            <div className="inline-flex items-center gap-2 text-slate-600">
              <SpinnerIcon className="h-4 w-4" />
              <span className="text-sm font-medium">
                {isStarting && 'Starting...'}
                {isResuming && 'Resuming...'}
                {isStopping && 'Stopping...'}
                {isSuspending && 'Pausing...'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {/* Start/Resume button */}
              <button
                onClick={() => onStartVM(vm)}
                disabled={vm.status === 'running'}
                className={`inline-flex items-center justify-center rounded-lg p-2 transition-all ${
                  vm.status === 'running'
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-300'
                }`}
                title={vm.status === 'paused' ? 'Resume VM' : 'Start VM'}
              >
                {vm.status === 'paused' ? <ResumeIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
              </button>

              {/* Pause button */}
              <button
                onClick={() => onSuspendVM(vm)}
                disabled={vm.status !== 'running'}
                className={`inline-flex items-center justify-center rounded-lg p-2 transition-all ${
                  vm.status !== 'running'
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-300'
                }`}
                title={vm.status !== 'running' ? 'VM must be running' : 'Pause VM'}
              >
                <PauseIcon className="h-4 w-4" />
              </button>

              {/* Stop button */}
              <button
                onClick={() => onStopVM(vm)}
                disabled={vm.status === 'stopped'}
                className={`inline-flex items-center justify-center rounded-lg p-2 transition-all ${
                  vm.status === 'stopped'
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-300'
                }`}
                title={vm.status === 'stopped' ? 'VM already stopped' : 'Stop VM'}
              >
                <StopIcon className="h-4 w-4" />
              </button>

              {/* Connect button */}
              <button
                onClick={() => onConnectVM(vm)}
                disabled={vm.status !== 'running' || !vm.spice}
                className={`inline-flex items-center justify-center rounded-lg p-2 transition-all ${
                  vm.status !== 'running' || !vm.spice
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-300'
                }`}
                title={
                  vm.status !== 'running'
                    ? 'VM must be running'
                    : !vm.spice
                    ? 'SPICE not enabled'
                    : 'Connect via SPICE'
                }
              >
                <PlugIcon className="h-4 w-4" />
              </button>
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
    prevProps.vm.spice === nextProps.vm.spice &&
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
