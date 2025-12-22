import { RouteObject } from 'react-router-dom'
import Login from '../pages/Login/Login'
import VirtualMachines from '../pages/VirtualMachines/VirtualMachines'
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute'
import MainLayout from '../layouts/MainLayout'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Login />,
  },
  {
    element: <MainLayout />,
    children: [
      {
        path: '/virtual-machines',
        element: (
          <ProtectedRoute>
            <VirtualMachines />
          </ProtectedRoute>
        ),
      },
    ],
  },
]
