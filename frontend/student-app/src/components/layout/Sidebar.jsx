import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import {
  LayoutDashboard, Briefcase, FileText, Mic,
  Map, BarChart2, Bell, Settings, LogOut, ChevronRight
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/jobs', icon: Briefcase, label: 'Job feed' },
  { to: '/dashboard/applications', icon: FileText, label: 'Applications' },
  { to: '/dashboard/interview', icon: Mic, label: 'Mock interview' },
  { to: '/dashboard/roadmap', icon: Map, label: 'Career roadmap' },
  { to: '/dashboard/analytics', icon: BarChart2, label: 'My progress' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() || 'ST'

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Plac<span className="text-blue-600">ify</span>
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">Campus placement portal</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                <span>{label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto text-blue-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-0.5">
        <NavLink
          to="/dashboard/notifications"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
        >
          <Bell size={18} className="text-gray-400" />
          <span>Notifications</span>
          <span className="ml-auto bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">3</span>
        </NavLink>
        <NavLink
          to="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
        >
          <Settings size={18} className="text-gray-400" />
          <span>Settings</span>
        </NavLink>
      </div>

      {/* User profile */}
      <div className="px-3 pb-4">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}