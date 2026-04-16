import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import useAuthStore from '../../store/authStore'
import { notificationApi } from '../../services/api'
import {
  LayoutDashboard, Briefcase, FileText, Mic,
  Map, BarChart2, Bell, Settings, LogOut, ChevronRight, User, Building2
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',              icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/jobs',         icon: Briefcase,       label: 'Job feed' },
  { to: '/dashboard/drives',       icon: Building2,       label: 'Drives' },
  { to: '/dashboard/applications', icon: FileText,        label: 'Applications' },
  { to: '/dashboard/interview',    icon: Mic,             label: 'Mock interview' },
  { to: '/dashboard/roadmap',      icon: Map,             label: 'Career roadmap' },
  { to: '/dashboard/analytics',    icon: BarChart2,       label: 'My progress' },
  { to: '/dashboard/profile',      icon: User,            label: 'My profile' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [notifCount, setNotifCount] = useState(0)

  useEffect(() => {
    if (location.pathname.startsWith('/dashboard/notifications')) { setNotifCount(0); return }
    if (!user) return
    notificationApi.unreadCount()
      .then(res => { setNotifCount(res?.data?.data?.count ?? 0) })
      .catch(() => setNotifCount(0))
  }, [user, location.pathname])

  const handleLogout = () => { logout(); navigate('/login') }
  const fullName = user?.fullName || user?.email?.split('@')[0] || 'Student'
  const initials = fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <aside className="w-64 min-h-screen flex flex-col border-r border-white/60 bg-white/70 backdrop-blur-xl shadow-xl">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100/80">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Plac<span className="text-indigo-600">ify</span>
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">Campus placement portal</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
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
          {notifCount > 0 && (
            <span className="ml-auto bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {notifCount}
            </span>
          )}
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
            <p className="text-xs text-indigo-500 font-medium">STUDENT</p>
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
