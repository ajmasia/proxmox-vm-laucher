import { useState, useRef, useEffect } from 'react'

interface TagFilterPopoverProps {
  selectedTags: string[]
  uniqueTags: string[]
  onToggleTag: (tag: string) => void
  onClearTags: () => void
}

export const TagFilterPopover = ({
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
            ? 'bg-ctp-teal text-ctp-base shadow-sm'
            : 'bg-ctp-surface0 text-ctp-subtext1 hover:bg-ctp-surface1 hover:text-ctp-text'
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
        <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg bg-ctp-mantle shadow-lg ring-1 ring-ctp-surface1">
          <div className="p-3">
            {/* Header */}
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-ctp-text">Filter by Tags</span>
              {selectedTags.length > 0 && (
                <button
                  onClick={onClearTags}
                  className="text-xs font-medium text-ctp-subtext0 hover:text-ctp-text"
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
                    className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-ctp-surface0"
                  >
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleTag(tag)}
                        className="peer h-4 w-4 cursor-pointer appearance-none rounded border-2 border-ctp-surface2 bg-ctp-base transition-all checked:border-ctp-mauve checked:bg-ctp-mauve hover:border-ctp-overlay0 focus:outline-none focus:ring-2 focus:ring-ctp-mauve focus:ring-offset-2 focus:ring-offset-ctp-mantle"
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
                    <span className="flex-1 text-sm text-ctp-subtext1">{tag}</span>
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

