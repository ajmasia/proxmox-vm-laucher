import { useEffect, useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { routes } from './config/routes'
import { useThemeStore } from './stores/themeStore'

const router = createBrowserRouter(routes)

function App() {
  const [isReady, setIsReady] = useState(false)
  const initTheme = useThemeStore((state) => state.initTheme)

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

  return <RouterProvider router={router} />
}

export default App
