import { memo, useMemo } from 'react'
import type { ProxmoxVM } from '../../../../types/proxmox'
import { PlayIcon, StopIcon, PauseIcon, ResumeIcon, MonitorIcon, PlugIcon } from '../../../../icons'
import { formatBytes, getStatusColor, getStatusDot } from './utils'
import Tooltip from '../../../../components/Tooltip/Tooltip'

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

const VMItem = memo(
  function VMItem({
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
    // Calculate display status based on transitional states
    const displayStatus = useMemo(() => {
      if (isStarting) return 'starting'
      if (isResuming) return 'resuming'
      if (isStopping) return 'stopping'
      if (isSuspending) return 'pausing'
      return vm.status
    }, [vm.status, isStarting, isResuming, isStopping, isSuspending])

    // Any operation in progress disables all buttons
    const isOperationInProgress = isStarting || isResuming || isStopping || isSuspending

    return (
      <div
        className={`group rounded-xl bg-white shadow-sm transition-all hover:shadow-md dark:bg-slate-800 ${
          vm.spice ? 'ring-2 ring-blue-400/40' : 'ring-1 ring-black/5 dark:ring-white/10'
        }`}
      >
        <div className="flex items-center gap-2 p-4">
          {/* VM Icon and Name */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
              <MonitorIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-slate-900 dark:text-slate-100">
                {vm.name}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                {/* Node Badge */}
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-600/10 dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-500/20">
                  {vm.node.toUpperCase()}
                </span>

                {/* VM ID Badge */}
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-600/10 dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-500/20">
                  {vm.vmid}
                </span>

                {/* SPICE Badge */}
                {vm.spice && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-900/50 dark:text-blue-400 dark:ring-blue-500/30">
                    <PlugIcon className="h-3 w-3" />
                    SPICE
                  </span>
                )}

                {/* IP Address Badge */}
                {vm.ipAddress && (
                  <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-900/50 dark:text-emerald-400 dark:ring-emerald-500/30">
                    {vm.ipAddress}
                  </span>
                )}

                {/* Tags */}
                {vm.tags && vm.tags.trim() && (
                  <>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    {vm.tags
                      .split(';')
                      .filter((tag) => tag.trim())
                      .map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-600/10 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-500/20"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex min-w-[90px] flex-shrink-0 justify-center">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusColor(displayStatus)}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(displayStatus)}`}></span>
              {displayStatus}
            </span>
          </div>

          {/* Resources */}
          <div className="min-w-[110px] flex-shrink-0 text-right">
            <div className="text-sm text-slate-900 dark:text-slate-100">{vm.cpus || 0} vCPU</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {formatBytes(vm.mem || 0)} / {formatBytes(vm.maxmem || 0)}
            </div>
          </div>

          {/* Actions */}
          <div className="flex min-h-[40px] min-w-[180px] flex-shrink-0 items-center justify-end">
            <div className="flex items-center gap-1.5">
              {/* Start/Resume button */}
              <Tooltip text={vm.status === 'paused' ? 'Resume VM' : 'Start VM'} position="top">
                <button
                  onClick={() => onStartVM(vm)}
                  disabled={isOperationInProgress || vm.status === 'running'}
                  className={`inline-flex items-center justify-center rounded-lg p-2 transition-all duration-200 ${
                    isOperationInProgress || vm.status === 'running'
                      ? 'cursor-not-allowed bg-slate-100 text-slate-400 opacity-50 dark:bg-slate-700 dark:text-slate-500'
                      : 'bg-slate-200 text-slate-700 hover:scale-105 hover:bg-slate-300 hover:text-slate-900 active:scale-95 dark:bg-slate-600 dark:text-slate-300 dark:hover:bg-slate-500 dark:hover:text-slate-100'
                  }`}
                >
                  {vm.status === 'paused' ? (
                    <ResumeIcon className="h-4 w-4" />
                  ) : (
                    <PlayIcon className="h-4 w-4" />
                  )}
                </button>
              </Tooltip>

              {/* Pause button */}
              <Tooltip
                text={vm.status !== 'running' ? 'VM must be running' : 'Pause VM'}
                position="top"
              >
                <button
                  onClick={() => onSuspendVM(vm)}
                  disabled={isOperationInProgress || vm.status !== 'running'}
                  className={`inline-flex items-center justify-center rounded-lg p-2 transition-all duration-200 ${
                    isOperationInProgress || vm.status !== 'running'
                      ? 'cursor-not-allowed bg-slate-100 text-slate-400 opacity-50 dark:bg-slate-700 dark:text-slate-500'
                      : 'bg-slate-200 text-slate-700 hover:scale-105 hover:bg-slate-300 hover:text-slate-900 active:scale-95 dark:bg-slate-600 dark:text-slate-300 dark:hover:bg-slate-500 dark:hover:text-slate-100'
                  }`}
                >
                  <PauseIcon className="h-4 w-4" />
                </button>
              </Tooltip>

              {/* Stop button */}
              <Tooltip
                text={vm.status === 'stopped' ? 'VM already stopped' : 'Stop VM'}
                position="top"
              >
                <button
                  onClick={() => onStopVM(vm)}
                  disabled={isOperationInProgress || vm.status === 'stopped'}
                  className={`inline-flex items-center justify-center rounded-lg p-2 transition-all duration-200 ${
                    isOperationInProgress || vm.status === 'stopped'
                      ? 'cursor-not-allowed bg-slate-100 text-slate-400 opacity-50 dark:bg-slate-700 dark:text-slate-500'
                      : 'bg-slate-200 text-slate-700 hover:scale-105 hover:bg-slate-300 hover:text-slate-900 active:scale-95 dark:bg-slate-600 dark:text-slate-300 dark:hover:bg-slate-500 dark:hover:text-slate-100'
                  }`}
                >
                  <StopIcon className="h-4 w-4" />
                </button>
              </Tooltip>

              {/* Connect button */}
              <Tooltip
                text={
                  vm.status !== 'running'
                    ? 'VM must be running'
                    : !vm.spice
                      ? 'SPICE not enabled'
                      : 'Connect via SPICE'
                }
                position="top"
              >
                <button
                  onClick={() => onConnectVM(vm)}
                  disabled={isOperationInProgress || vm.status !== 'running' || !vm.spice}
                  className={`inline-flex items-center justify-center rounded-lg p-2 transition-all duration-200 ${
                    isOperationInProgress || vm.status !== 'running' || !vm.spice
                      ? 'cursor-not-allowed bg-slate-100 text-slate-400 opacity-50 dark:bg-slate-700 dark:text-slate-500'
                      : 'bg-slate-200 text-slate-700 hover:scale-105 hover:bg-slate-300 hover:text-slate-900 active:scale-95 dark:bg-slate-600 dark:text-slate-300 dark:hover:bg-slate-500 dark:hover:text-slate-100'
                  }`}
                >
                  <PlugIcon className="h-4 w-4" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    )
  },
  (prevProps, nextProps) => {
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
      prevProps.vm.ipAddress === nextProps.vm.ipAddress &&
      prevProps.isStarting === nextProps.isStarting &&
      prevProps.isStopping === nextProps.isStopping &&
      prevProps.isSuspending === nextProps.isSuspending &&
      prevProps.isResuming === nextProps.isResuming
    )
  }
)

export default VMItem
