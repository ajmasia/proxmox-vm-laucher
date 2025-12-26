import { memo, useMemo } from 'react'
import type { ProxmoxVM } from '../../../../types/proxmox'
import { PlayIcon, StopIcon, PauseIcon, ResumeIcon, MonitorIcon, PlugIcon } from '../../../../icons'
import { formatBytes, getStatusColor, getStatusDot } from './utils'
import { Tooltip } from '../../../../components/Tooltip/Tooltip'

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

export const VMItem = memo(
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
        className={`group rounded-xl bg-ctp-mantle shadow-sm transition-all hover:shadow-md ${
          vm.spice ? 'ring-2 ring-ctp-blue/40' : 'ring-1 ring-ctp-surface1'
        }`}
      >
        <div className="flex items-center gap-2 p-4">
          {/* VM Icon and Name */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-ctp-surface0 text-ctp-subtext0">
              <MonitorIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-ctp-text">{vm.name}</div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                {/* Node Badge */}
                <span className="inline-flex items-center rounded-md bg-ctp-surface0 px-2 py-0.5 text-xs font-medium text-ctp-subtext1 ring-1 ring-ctp-surface1">
                  {vm.node.toUpperCase()}
                </span>

                {/* VM ID Badge */}
                <span className="inline-flex items-center rounded-md bg-ctp-surface0 px-2 py-0.5 text-xs font-medium text-ctp-subtext1 ring-1 ring-ctp-surface1">
                  {vm.vmid}
                </span>

                {/* SPICE Badge */}
                {vm.spice && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-ctp-blue/20 px-2 py-0.5 text-xs font-medium text-ctp-blue ring-1 ring-ctp-blue/30">
                    <PlugIcon className="h-3 w-3" />
                    SPICE
                  </span>
                )}

                {/* IP Address Badge */}
                {vm.ipAddress && (
                  <span className="inline-flex items-center rounded-md bg-ctp-green/20 px-2 py-0.5 text-xs font-medium text-ctp-green ring-1 ring-ctp-green/30">
                    {vm.ipAddress}
                  </span>
                )}

                {/* Tags */}
                {vm.tags && vm.tags.trim() && (
                  <>
                    <span className="text-ctp-surface2">•</span>
                    {vm.tags
                      .split(';')
                      .filter((tag) => tag.trim())
                      .map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-md bg-ctp-lavender/20 px-2 py-0.5 text-xs font-medium text-ctp-lavender ring-1 ring-ctp-lavender/30"
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
            <div className="text-sm text-ctp-text">{vm.cpus || 0} vCPU</div>
            <div className="text-xs text-ctp-subtext0">
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
                      ? 'cursor-not-allowed bg-ctp-surface0 text-ctp-overlay0 opacity-50'
                      : 'bg-ctp-surface0 text-ctp-subtext1 hover:scale-105 hover:bg-ctp-surface1 hover:text-ctp-text active:scale-95'
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
                      ? 'cursor-not-allowed bg-ctp-surface0 text-ctp-overlay0 opacity-50'
                      : 'bg-ctp-surface0 text-ctp-subtext1 hover:scale-105 hover:bg-ctp-surface1 hover:text-ctp-text active:scale-95'
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
                      ? 'cursor-not-allowed bg-ctp-surface0 text-ctp-overlay0 opacity-50'
                      : 'bg-ctp-surface0 text-ctp-subtext1 hover:scale-105 hover:bg-ctp-surface1 hover:text-ctp-text active:scale-95'
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
                      ? 'cursor-not-allowed bg-ctp-surface0 text-ctp-overlay0 opacity-50'
                      : 'bg-ctp-surface0 text-ctp-subtext1 hover:scale-105 hover:bg-ctp-surface1 hover:text-ctp-text active:scale-95'
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
