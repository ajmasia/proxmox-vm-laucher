import { RouteObject } from 'react-router-dom'
import Login from '../pages/Login/Login'
import AddServer from '../pages/AddServer/AddServer'
import VirtualMachines from '../pages/VirtualMachines/VirtualMachines'
import { ProtectedRoute } from './guards/ProtectedRoute'
import MainLayout from '../layouts/MainLayout'
import VirtualMachinesLayout from './VirtualMachinesLayout'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/add-server',
    element: <AddServer />,
  },
  {
    element: <MainLayout />,
    children: [
      {
        element: <VirtualMachinesLayout />,
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
    ],
  },
]
