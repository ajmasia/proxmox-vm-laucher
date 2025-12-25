import { useEffect } from 'react'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { TitleBar } from './components/TitleBar'
import { routes } from './config/routes'
import { useThemeStore } from './stores/themeStore'
import { useUpdateStore } from './stores/updateStore'

const router = createHashRouter(routes)

function App() {
  const { initTheme } = useThemeStore()
  const { checkForUpdates } = useUpdateStore()

  useEffect(() => {
    initTheme()
    checkForUpdates()
    // Show window after React has rendered
    window.electronAPI.showWindow()
  }, [initTheme, checkForUpdates])

  return (
    <div className="flex h-screen flex-col overflow-hidden rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900">
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
