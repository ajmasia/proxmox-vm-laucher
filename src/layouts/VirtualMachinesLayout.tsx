import { Outlet } from 'react-router-dom'
import { useLayout } from '../contexts/LayoutContext'
import { LayoutProvider } from '../contexts/LayoutProvider'
import AppHeader from './components/Header/AppHeader'
import AppFooter from './components/Footer/AppFooter'

const VirtualMachinesLayoutContent = () => {
  const { onRefresh, isLoading, filterSlot } = useLayout()

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header - Fixed, full width */}
      <AppHeader onRefresh={onRefresh || (() => {})} isLoading={isLoading} />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 overflow-hidden p-6">
        {/* Filter - Fixed */}
        {filterSlot}

        {/* Main Content - Scrollable (VM list only) */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>

      {/* Footer - Fixed, full width */}
      <AppFooter />
    </div>
  )
}

const VirtualMachinesLayout = () => {
  return (
    <LayoutProvider>
      <VirtualMachinesLayoutContent />
    </LayoutProvider>
  )
}

export default VirtualMachinesLayout
