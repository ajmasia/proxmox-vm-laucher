import { Outlet } from 'react-router-dom'
import { LayoutProvider } from '../contexts/LayoutProvider'
import AppHeader from './components/Header/AppHeader'
import AppFooter from './components/Footer/AppFooter'

const MainLayoutContent = () => {
  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <AppHeader />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
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
