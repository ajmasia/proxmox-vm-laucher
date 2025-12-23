import { useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { routes } from './config/routes'
import { useThemeStore } from './stores/themeStore'

const router = createBrowserRouter(routes)

function App() {
  const initTheme = useThemeStore((state) => state.initTheme)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  return <RouterProvider router={router} />
}

export default App
