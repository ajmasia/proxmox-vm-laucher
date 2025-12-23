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

const VMFilter = ({
  statusFilter,
  selectedTags,
  spiceOnly,
  uniqueTags,
  onStatusFilterChange,
  onToggleTag,
  onClearTags,
  onSpiceOnlyChange,
  onClearFilters,
}: VMFilterProps) => {
  const statusOptions = ['all', 'running', 'stopped', 'paused'] as const
  const hasActiveFilters = statusFilter !== 'all' || selectedTags.length > 0 || !spiceOnly

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-4">
        <div className="flex min-h-[40px] flex-wrap items-center gap-4">
        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Status:</label>
          <div className="flex flex-wrap gap-1.5">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => onStatusFilterChange(status)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                  statusFilter === status
                    ? status === 'all'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'bg-blue-100 text-blue-700 ring-1 ring-blue-600/20'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300 hover:text-slate-900'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tag Filter */}
        {uniqueTags.length > 0 && uniqueTags.length <= 5 && (
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Tags:</label>
            <div className="flex flex-wrap gap-1.5">
              {uniqueTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onToggleTag(tag)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-600/20'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300 hover:text-slate-900'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tag Filter Popover (for more than 5 tags) */}
        {uniqueTags.length > 5 && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Tags:</label>
            <TagFilterPopover
              selectedTags={selectedTags}
              uniqueTags={uniqueTags}
              onToggleTag={onToggleTag}
              onClearTags={onClearTags}
            />
          </div>
        )}

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
            className="ml-auto inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-400 hover:text-slate-900"
            title="Clear filters"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 48 48"
              fill="none"
              stroke="currentColor"
              strokeWidth={4}
              strokeLinejoin="round"
            >
              <path strokeLinecap="round" d="M20 5.914h8v8h15v8H5v-8h15z" clipRule="evenodd" />
              <path d="M8 40h32V22H8z" />
              <path strokeLinecap="round" d="M16 39.898v-5.984m8 5.984v-6m8 6v-5.984M12 40h24" />
            </svg>
            Clear
          </button>
        )}
        </div>
      </div>
    </div>
  )
}

export default VMFilter
