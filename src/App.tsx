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
        toastOptions={{
          className: 'dark:bg-slate-800 dark:text-slate-100',
        }}
      />
    </div>
  )
}

export default App
