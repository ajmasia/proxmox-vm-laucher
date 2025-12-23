import { Outlet } from 'react-router-dom'
import { useLayout } from '../contexts/LayoutContext'
import { LayoutProvider } from '../contexts/LayoutProvider'
import AppHeader from './components/Header/AppHeader'
import AppFooter from './components/Footer/AppFooter'

const MainLayoutContent = () => {
  const { onRefresh, isLoading } = useLayout()

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <AppHeader onRefresh={onRefresh || (() => {})} isLoading={isLoading} />

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>

      {/* Footer */}
      <AppFooter />
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
