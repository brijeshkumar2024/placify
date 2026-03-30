import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen" style={{
      background: 'radial-gradient(circle at 15% 15%, rgba(99,102,241,0.07), transparent 35%), radial-gradient(circle at 85% 5%, rgba(139,92,246,0.07), transparent 35%), #F8FAFC'
    }}>
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
