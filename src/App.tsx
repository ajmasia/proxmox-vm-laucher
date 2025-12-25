import { useEffect, useState } from 'react'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import clsx from 'clsx'
import { TitleBar } from './components/TitleBar'
import { routes } from './config/routes'
import { useThemeStore } from './stores/themeStore'
import { useUpdateStore } from './stores/updateStore'

const router = createHashRouter(routes)

function App() {
  const { initTheme } = useThemeStore()
  const { checkForUpdates } = useUpdateStore()
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    initTheme()
    checkForUpdates()
    // Show window after React has rendered
    window.electronAPI.showWindow()

    // Check initial maximized state and listen for changes
    window.electronAPI.isMaximized().then(setIsMaximized)
    window.electronAPI.onMaximizedChange(setIsMaximized)
  }, [initTheme, checkForUpdates])

  return (
    <div
      className={clsx(
        'flex h-screen flex-col overflow-hidden border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900',
        !isMaximized && 'rounded-xl'
      )}
    >
      <TitleBar />
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
            toast:
              'flex items-center gap-3 w-full rounded-lg px-4 py-3 shadow-lg',
            success:
              'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
            error:
              'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            info: 'bg-sky-50 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
            warning:
              'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
            title: 'font-medium',
            description: 'text-sm opacity-80',
          },
        }}
      />
    </div>
  )
}

export default App
