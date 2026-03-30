import { AnimatePresence, motion } from 'framer-motion'
import { NavLink, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, LogOut, Plus, X } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { sidebarSections } from './navigation'

export default function Sidebar({
  collapsed = false,
  mobileOpen = false,
  onToggleCollapse = () => {},
  onClose = () => {},
}) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const fullName = user?.fullName || user?.email?.split('@')[0] || 'Recruiter'
  const initials = fullName.split(' ').map((name) => name[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/35 lg:hidden"
            aria-label="Close navigation"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 92 : 280 }}
        className={`fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
          <div className="min-w-0">
            <p className="text-lg font-bold text-slate-900">
              Plac<span className="text-blue-600">ify</span>
            </p>
            {!collapsed && <p className="text-xs text-slate-500">Recruiter workspace</p>}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-gray-100 lg:inline-flex"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-gray-100 lg:hidden"
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="px-3 py-4">
          <button
            type="button"
            onClick={() => {
              navigate('/dashboard/post-job')
              onClose()
            }}
            className="btn-premium w-full justify-center rounded-2xl"
          >
            <Plus size={16} />
            {!collapsed && <span>Post new role</span>}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {sidebarSections.map((section) => (
            <div key={section.title} className="mb-5">
              {!collapsed && (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {section.title}
                </p>
              )}

              <div className="space-y-1">
                {section.items.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/dashboard'}
                    onClick={onClose}
                    title={label}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 shadow-sm'
                          : 'text-slate-600 hover:bg-gray-100 hover:text-slate-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-700'} />
                        {!collapsed && <span>{label}</span>}
                        {!collapsed && isActive && <ChevronRight size={14} className="ml-auto text-blue-400" />}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <div className={`rounded-2xl border border-slate-200 bg-slate-50 ${collapsed ? 'p-2' : 'p-3'}`}>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 text-xs font-semibold text-white shadow-sm"
              >
                {initials}
              </div>

              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{fullName}</p>
                  <p className="text-xs text-slate-500">Premium recruiter</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                className="rounded-xl p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
