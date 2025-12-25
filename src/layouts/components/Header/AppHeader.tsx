import { MonitorIcon } from '../../../icons'

const AppHeader = () => {
  return (
    <div className="px-6 pb-2 pt-6">
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700 dark:bg-slate-600">
          <MonitorIcon className="h-6 w-6 text-white" />
        </div>
        {/* Title */}
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Proxmox</h2>
          <span className="text-slate-400 dark:text-slate-500">•</span>
          <h2 className="text-lg font-medium text-slate-600 dark:text-slate-300">
            Virtual Machines
          </h2>
        </div>
      </div>
    </div>
  )
}

export default AppHeader
