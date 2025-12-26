import { Outlet } from 'react-router-dom'
import { LayoutProvider } from '../contexts/LayoutProvider'
import AppHeader from './components/Header/AppHeader'
import AppFooter from './components/Footer/AppFooter'

const MainLayoutContent = () => {
  return (
    <div className="flex h-full flex-col bg-ctp-base">
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
