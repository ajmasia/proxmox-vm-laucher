import { RouteObject } from 'react-router-dom'
import VirtualMachines from '../pages/VirtualMachines/VirtualMachines'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <VirtualMachines />,
  },
]
