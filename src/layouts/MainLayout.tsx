import { Outlet } from 'react-router-dom'
import Header from '../components/Header/Header'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto w-full max-w-7xl">
        <Header />
        <Outlet />
      </div>
    </div>
  )
}
