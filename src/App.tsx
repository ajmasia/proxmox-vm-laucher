import { useEffect, useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { Toaster } from 'sonner'
import { routes } from './config/routes'
import { useThemeStore } from './stores/themeStore'

const router = createBrowserRouter(routes)

function App() {
  const [isReady, setIsReady] = useState(false)
  const initTheme = useThemeStore((state) => state.initTheme)
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme)

  useEffect(() => {
    async function init() {
      try {
        await initTheme()
      } catch (e) {
        console.error('Theme init error:', e)
      }

      // Always show window, even if theme init fails
      try {
        const window = getCurrentWindow()
        await window.show()
        await window.setFocus()
      } catch (e) {
        console.error('Window show error:', e)
      }

      setIsReady(true)
    }
    init()
  }, [initTheme])

  if (!isReady) return null

  return (
    <>
      <Toaster
        position="bottom-right"
        theme={resolvedTheme}
        closeButton
        duration={4000}
        offset="68px"
        gap={8}
        style={{ right: '24px' }}
        toastOptions={{
          classNames: {
            toast: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 group',
            title: 'text-slate-900 dark:text-slate-100',
            description: 'text-slate-600 dark:text-slate-400',
            success: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
            error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
            warning: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300',
            info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
            closeButton: '!right-2 !top-2 !left-auto !transform-none !border-0 !bg-transparent hover:!bg-slate-200 dark:hover:!bg-slate-700 !text-slate-500 dark:!text-slate-400',
          },
        }}
      />
      <RouterProvider router={router} />
    </>
  )
}

export default App
