import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import {
  LayoutDashboard, Building2, Users, FileBarChart,
  Bell, Settings, LogOut, ChevronRight, GraduationCap
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',              icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/drives',       icon: Building2,       label: 'Placement drives' },
  { to: '/dashboard/students',     icon: GraduationCap,   label: 'Students' },
  { to: '/dashboard/companies',    icon: Building2,       label: 'Companies' },
  { to: '/dashboard/reports',      icon: FileBarChart,    label: 'Reports' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const handleLogout = () => { logout(); navigate('/login') }

  const fullName = user?.fullName || user?.email?.split('@')[0] || 'TPO'
  const initials = fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <aside className="w-64 min-h-screen flex flex-col border-r border-white/60 bg-white/70 backdrop-blur-xl shadow-xl">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100/80">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Plac<span className="text-indigo-600">ify</span>
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">TPO portal</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'text-gray-600 hover:bg-white/80 hover:text-gray-900 hover:shadow-sm'
              }`
            }>
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'} />
                <span>{label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto text-indigo-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom links */}
      <div className="px-3 py-3 border-t border-gray-100/80 space-y-0.5">
        <NavLink to="/dashboard/notifications"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-white/80 hover:text-gray-900'
            }`
          }>
          <Bell size={18} className="text-gray-400" />
          <span>Notifications</span>
          <span className="ml-auto bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">5</span>
        </NavLink>
        <NavLink to="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-white/80 hover:text-gray-900 transition-all">
          <Settings size={18} className="text-gray-400" />
          <span>Settings</span>
        </NavLink>
      </div>

      {/* User */}
      <div className="px-3 pb-5">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100/60">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-semibold text-white text-xs shadow"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{fullName.split(' ')[0]}</p>
            <p className="text-xs text-indigo-500 font-medium">TPO</p>
          </div>
          <button onClick={handleLogout} title="Sign out"
            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
