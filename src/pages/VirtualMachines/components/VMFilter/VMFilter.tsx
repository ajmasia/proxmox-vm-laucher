interface VMFilterProps {
  statusFilter: string
  tagFilter: string
  uniqueTags: string[]
  onStatusFilterChange: (value: string) => void
  onTagFilterChange: (value: string) => void
  onClearFilters: () => void
}

export default function VMFilter({
  statusFilter,
  tagFilter,
  uniqueTags,
  onStatusFilterChange,
  onTagFilterChange,
  onClearFilters,
}: VMFilterProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-slate-700">Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All</option>
          <option value="running">Running</option>
          <option value="stopped">Stopped</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      {uniqueTags.length > 0 && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Tag:</label>
          <select
            value={tagFilter}
            onChange={(e) => onTagFilterChange(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Tags</option>
            {uniqueTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      )}

      {(statusFilter !== 'all' || tagFilter !== 'all') && (
        <button
          onClick={onClearFilters}
          className="ml-auto text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
