import { memo } from 'react'
import TagFilterPopover from '../TagFilterPopover/TagFilterPopover'
import { Tooltip } from '../../../../components/Tooltip/Tooltip'

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

const VMFilter = memo(function VMFilter({
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
  const hasActiveFilters = statusFilter !== 'all' || selectedTags.length > 0 || !spiceOnly

  return (
    <div className="flex min-h-[40px] flex-wrap items-center gap-4 px-6 py-4">
      {/* Status Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm font-medium text-ctp-subtext1">Status:</label>
        <div className="flex flex-wrap gap-1.5">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => onStatusFilterChange(status)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                statusFilter === status
                  ? 'bg-ctp-teal text-ctp-base shadow-sm'
                  : 'bg-ctp-surface0 text-ctp-subtext1 hover:bg-ctp-surface1 hover:text-ctp-text'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tag Filter */}
      {uniqueTags.length > 0 && uniqueTags.length <= 6 && (
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium text-ctp-subtext1">Tags:</label>
          <div className="flex flex-wrap gap-1.5">
            {uniqueTags.map((tag) => (
              <button
                key={tag}
                onClick={() => onToggleTag(tag)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                  selectedTags.includes(tag)
                    ? 'bg-ctp-teal text-ctp-base shadow-sm'
                    : 'bg-ctp-surface0 text-ctp-subtext1 hover:bg-ctp-surface1 hover:text-ctp-text'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tag Filter Popover (for more than 6 tags) */}
      {uniqueTags.length > 6 && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-ctp-subtext1">Tags:</label>
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
        <label className="flex cursor-pointer select-none items-center gap-2">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              checked={spiceOnly}
              onChange={(e) => onSpiceOnlyChange(e.target.checked)}
              className="peer h-4 w-4 cursor-pointer appearance-none rounded border-2 border-ctp-surface2 bg-ctp-mantle transition-all checked:border-ctp-mauve checked:bg-ctp-mauve hover:border-ctp-overlay0 focus:outline-none focus:ring-2 focus:ring-ctp-mauve focus:ring-offset-2 focus:ring-offset-ctp-base"
            />
            <svg
              className="pointer-events-none absolute h-3 w-3 text-ctp-base opacity-0 transition-opacity peer-checked:opacity-100"
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
          <span className="text-sm font-medium text-ctp-subtext1">SPICE only</span>
        </label>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Tooltip text="Clear filters" position="top">
          <button
            onClick={onClearFilters}
            className="ml-auto inline-flex items-center gap-2 rounded-lg border border-ctp-surface1 bg-ctp-mantle px-3 py-1.5 text-sm font-medium text-ctp-subtext1 transition-all hover:border-ctp-surface2 hover:text-ctp-text"
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
        </Tooltip>
      )}
    </div>
  )
})

export default VMFilter
