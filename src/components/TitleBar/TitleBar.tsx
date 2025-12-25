import { getCurrentWindow } from '@tauri-apps/api/window'

const TitleBar = () => {
  const handleClose = async () => {
    const window = getCurrentWindow()
    await window.close()
  }

  return (
    <div
      data-tauri-drag-region
      className="fixed top-0 left-0 right-0 z-50 flex h-8 select-none items-center justify-between rounded-t-xl bg-slate-100 dark:bg-slate-800"
    >
      <div data-tauri-drag-region className="flex-1 pl-3 text-sm font-medium text-slate-600 dark:text-slate-400">
        PVE Launcher
      </div>
      <button
        onClick={handleClose}
        className="flex h-8 w-12 items-center justify-center rounded-tr-xl text-slate-500 transition-colors hover:bg-red-500 hover:text-white dark:text-slate-400"
        title="Close"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export default TitleBar
