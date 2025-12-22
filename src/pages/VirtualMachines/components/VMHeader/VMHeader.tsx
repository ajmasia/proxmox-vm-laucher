import { RefreshIcon } from '../../../../icons'

interface VMHeaderProps {
  onReconfigure: () => void
  onRefresh: () => void
  isLoading: boolean
}

const VMHeader = ({ onReconfigure, onRefresh, isLoading }: VMHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-slate-900">Virtual Machines</h2>
      <div className="flex items-center gap-3">
        <button
          onClick={onReconfigure}
          className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          Reconfigure
        </button>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-black/5 transition-all hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshIcon className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>
    </div>
  )
}

export default VMHeader
