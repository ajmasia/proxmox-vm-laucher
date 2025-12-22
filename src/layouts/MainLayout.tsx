import { Outlet } from 'react-router-dom'
import { useLayout } from '../contexts/LayoutContext'
import { LayoutProvider } from '../contexts/LayoutProvider'
import AppHeader from './components/Header/AppHeader'
import AppFooter from './components/Footer/AppFooter'

const MainLayoutContent = () => {
  const { onRefresh, isLoading } = useLayout()

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 overflow-hidden p-6">
        {/* Header */}
        <AppHeader onRefresh={onRefresh || (() => {})} isLoading={isLoading} />

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>

        {/* Footer */}
        <AppFooter />
      </div>
    </div>
  )
}

const MainLayout = () => {
  return (
    <LayoutProvider>
      <MainLayoutContent />
    </LayoutProvider>
  )
}

export default MainLayout
