import { MonitorIcon } from '../../../icons'

const AppHeader = () => {
  return (
    <div className="px-6 pb-2 pt-6">
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ctp-mauve">
          <MonitorIcon className="h-6 w-6 text-ctp-base" />
        </div>
        {/* Title */}
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-ctp-text">Proxmox</h2>
          <span className="text-ctp-overlay0">•</span>
          <h2 className="text-lg font-medium text-ctp-subtext0">Virtual Machines</h2>
        </div>
      </div>
    </div>
  )
}

export default AppHeader
