import { ReactNode, useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  children: ReactNode
  text: string
  position?: 'top' | 'bottom'
  delay?: number
}

export const Tooltip = ({ children, text, position = 'bottom', delay = 1000 }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
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
    }, delay)
  }, [position, delay])

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
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
            <div className="whitespace-nowrap rounded-lg bg-ctp-surface0 px-3 py-1.5 text-xs font-medium text-ctp-text shadow-lg">
              {text}
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
