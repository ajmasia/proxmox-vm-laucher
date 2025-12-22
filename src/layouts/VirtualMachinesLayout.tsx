import { Outlet } from 'react-router-dom'
import { useLayout } from '../contexts/LayoutContext'
import { LayoutProvider } from '../contexts/LayoutProvider'
import AppHeader from './components/Header/AppHeader'
import AppFooter from './components/Footer/AppFooter'

const VirtualMachinesLayoutContent = () => {
  const { onRefresh, isLoading, filterSlot } = useLayout()

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-4 overflow-hidden p-6">
        {/* Header - Fixed */}
        <AppHeader onRefresh={onRefresh || (() => {})} isLoading={isLoading} />

        {/* Filter - Fixed */}
        {filterSlot}

        {/* Main Content - Scrollable (VM list only) */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>

        {/* Footer - Fixed */}
        <AppFooter />
      </div>
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
