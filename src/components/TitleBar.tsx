interface TitleBarProps {
  title?: string
}

export function TitleBar({ title = 'PVE Launcher' }: TitleBarProps) {
  const handleClose = () => {
    window.electronAPI.closeWindow()
  }

  return (
    <div
      className="flex h-[46px] select-none items-center justify-between border-b border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left side - empty for balance */}
      <div className="w-[46px]" />

      {/* Title - centered */}
      <div className="flex-1 text-center">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {title}
        </span>
      </div>

      {/* Right side - close button */}
      <div
        className="flex h-[46px] w-[46px] items-center justify-center"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={handleClose}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200/60 text-slate-500 transition-all hover:bg-red-500 hover:text-white dark:bg-slate-700/60 dark:text-slate-400 dark:hover:bg-red-500 dark:hover:text-white"
          title="Close"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.3 5.71a1 1 0 0 0-1.42 0L12 10.59 7.12 5.71a1 1 0 0 0-1.42 1.42L10.59 12l-4.89 4.88a1 1 0 1 0 1.42 1.42L12 13.41l4.88 4.89a1 1 0 0 0 1.42-1.42L13.41 12l4.89-4.88a1 1 0 0 0 0-1.41z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
