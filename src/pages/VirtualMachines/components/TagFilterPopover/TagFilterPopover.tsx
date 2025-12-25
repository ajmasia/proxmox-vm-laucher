import { useState, useRef, useEffect } from 'react'

interface TagFilterPopoverProps {
  selectedTags: string[]
  uniqueTags: string[]
  onToggleTag: (tag: string) => void
  onClearTags: () => void
}

const TagFilterPopover = ({
  selectedTags,
  uniqueTags,
  onToggleTag,
  onClearTags,
}: TagFilterPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  if (uniqueTags.length === 0) return null

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
          selectedTags.length > 0
            ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-900/50 dark:text-blue-400 dark:ring-blue-500/30'
            : 'bg-slate-200 text-slate-600 hover:bg-slate-300 hover:text-slate-900 dark:bg-slate-600 dark:text-slate-300 dark:hover:bg-slate-500 dark:hover:text-slate-100'
        }`}
      >
        Tags
        {selectedTags.length > 0 && (
          <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-white/20 px-1.5 py-0.5 text-xs font-medium">
            {selectedTags.length}
          </span>
        )}
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg bg-white shadow-lg ring-1 ring-black/5 dark:bg-slate-700 dark:ring-white/10">
          <div className="p-3">
            {/* Header */}
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Filter by Tags
              </span>
              {selectedTags.length > 0 && (
                <button
                  onClick={onClearTags}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Tag List */}
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {uniqueTags.map((tag) => {
                const isSelected = selectedTags.includes(tag)
                return (
                  <label
                    key={tag}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-600"
                  >
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleTag(tag)}
                        className="peer h-4 w-4 cursor-pointer appearance-none rounded border-2 border-slate-300 bg-white transition-all checked:border-slate-700 checked:bg-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:border-slate-500 dark:bg-slate-600 dark:checked:border-slate-500 dark:checked:bg-slate-500 dark:hover:border-slate-400 dark:focus:ring-offset-slate-700"
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
                    <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">{tag}</span>
                  </label>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TagFilterPopover
