import { useEffect, useState } from 'react'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import clsx from 'clsx'
import { TitleBar } from './components/TitleBar'
import { routes } from './config/routes'
import { useThemeStore } from './stores/themeStore'
import { useUpdateStore } from './stores/updateStore'
import { useAuthStore } from './stores/authStore'

const router = createHashRouter(routes)

function App() {
  const { initTheme } = useThemeStore()
  const { checkForUpdates } = useUpdateStore()
  const { restoreSession, session } = useAuthStore()
  const [windowType, setWindowType] = useState<'login' | 'addServer' | 'main' | 'unknown'>(
    'unknown'
  )
  const [isReady, setIsReady] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    initTheme()

    // Detect window type first
    window.electronAPI.getWindowType().then(async (type) => {
      setWindowType(type)

      if (type === 'main') {
        // Main window: check for updates
        checkForUpdates()

        // Request pending session from main process
        const pendingSession = await window.electronAPI.requestSession()
        if (pendingSession) {
          restoreSession(pendingSession)
        }

        // Setup maximized state tracking
        window.electronAPI.isMaximized().then(setIsMaximized)
        window.electronAPI.onMaximizedChange(setIsMaximized)
      }

      // Mark as ready and show window
      setIsReady(true)
      window.electronAPI.showWindow()
    })
  }, [initTheme, checkForUpdates, restoreSession])

  // Login and AddServer windows have simpler styling (no TitleBar, always rounded)
  const isSmallWindow = windowType === 'login' || windowType === 'addServer'

  // Don't render until ready (prevents race condition with session restoration)
  // For main window, also wait for session to be in the store
  if (!isReady || (windowType === 'main' && !session)) {
    return (
      <div className="flex h-screen items-center justify-center rounded-xl bg-white dark:bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600 dark:border-slate-700 dark:border-t-slate-400" />
      </div>
    )
  }

  return (
    <div
      className={clsx(
        'flex h-screen flex-col overflow-hidden bg-white dark:bg-slate-900',
        isSmallWindow ? 'rounded-xl' : !isMaximized && 'rounded-xl'
      )}
    >
      {!isSmallWindow && <TitleBar />}
      <main className="flex-1 overflow-hidden">
        <RouterProvider router={router} />
      </main>
      <Toaster
        position="bottom-right"
        offset={80}
        style={{ right: 24 }}
        toastOptions={{
          unstyled: true,
          classNames: {
            toast: 'flex items-center gap-3 w-full rounded-lg px-4 py-3 shadow-lg',
            success: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
            error: 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            info: 'bg-sky-50 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
            warning: 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
            title: 'font-medium',
            description: 'text-sm opacity-80',
          },
        }}
      />
    </div>
  )
}

export default App
