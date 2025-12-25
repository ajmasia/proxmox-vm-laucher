import { ReactNode, useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  children: ReactNode
  text: string
  position?: 'top' | 'bottom'
}

const Tooltip = ({ children, text, position = 'bottom' }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const tooltipOffset = 8

      if (position === 'top') {
        setCoords({
          top: rect.top - tooltipOffset,
          left: rect.left + rect.width / 2,
        })
      } else {
        setCoords({
          top: rect.bottom + tooltipOffset,
          left: rect.left + rect.width / 2,
        })
      }
      setIsVisible(true)
    }
  }, [position])

  const handleMouseLeave = useCallback(() => {
    setIsVisible(false)
  }, [])

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-flex"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {isVisible &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[9999] -translate-x-1/2"
            style={{
              top: position === 'top' ? undefined : coords.top,
              bottom: position === 'top' ? `calc(100vh - ${coords.top}px)` : undefined,
              left: coords.left,
            }}
          >
            <div className="whitespace-nowrap rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 shadow-lg dark:bg-slate-900">
              {text}
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

export default Tooltip
