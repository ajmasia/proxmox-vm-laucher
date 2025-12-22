import TagFilterPopover from '../TagFilterPopover/TagFilterPopover'

interface VMFilterProps {
  statusFilter: string
  selectedTags: string[]
  spiceOnly: boolean
  uniqueTags: string[]
  onStatusFilterChange: (value: string) => void
  onToggleTag: (tag: string) => void
  onClearTags: () => void
  onSpiceOnlyChange: (enabled: boolean) => void
  onClearFilters: () => void
}

export default function VMFilter({
  statusFilter,
  selectedTags,
  spiceOnly,
  uniqueTags,
  onStatusFilterChange,
  onToggleTag,
  onClearTags,
  onSpiceOnlyChange,
  onClearFilters,
}: VMFilterProps) {
  const statusOptions = ['all', 'running', 'stopped', 'paused'] as const
  const hasActiveFilters = statusFilter !== 'all' || selectedTags.length > 0 || spiceOnly

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <div className="flex flex-wrap items-center gap-4">
        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Status:</label>
          <div className="flex flex-wrap gap-1.5">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => onStatusFilterChange(status)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tag Filter Popover */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Tags:</label>
          <TagFilterPopover
            selectedTags={selectedTags}
            uniqueTags={uniqueTags}
            onToggleTag={onToggleTag}
            onClearTags={onClearTags}
          />
        </div>

        {/* SPICE Filter */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                checked={spiceOnly}
                onChange={(e) => onSpiceOnlyChange(e.target.checked)}
                className="peer h-4 w-4 cursor-pointer appearance-none rounded border-2 border-slate-300 bg-white transition-all checked:border-slate-700 checked:bg-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              />
              <svg
                className="pointer-events-none absolute h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                viewBox="0 0 12 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.5 1.5L4.5 8.5L1.5 5.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-700">SPICE only</span>
          </label>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="ml-auto text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
