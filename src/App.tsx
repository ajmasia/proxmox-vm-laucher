import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import { routes } from './config/routes'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: routes,
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
