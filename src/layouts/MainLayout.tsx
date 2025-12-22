import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <Outlet />
      </div>
    </div>
  )
}

export default MainLayout
