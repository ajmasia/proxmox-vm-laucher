import { Outlet } from 'react-router-dom'
import { useLayout } from '../contexts/LayoutContext'

const VirtualMachinesLayout = () => {
  const { filterSlot } = useLayout()

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Filter - Fixed */}
      {filterSlot}

      {/* Main Content - Scrollable (VM list only) */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-y-auto p-6">
        <Outlet />
      </div>
    </div>
  )
}

export default VirtualMachinesLayout
