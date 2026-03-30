import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, ChevronDown, LogOut, Menu, Search, Settings } from 'lucide-react'
import Sidebar from './Sidebar'
import useAuthStore from '../../store/authStore'
import { flatNavigationItems, getPageMeta } from './navigation'

export default function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [query, setQuery] = useState('')

  const pageMeta = getPageMeta(location.pathname)

  const searchSuggestions = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return []
    return flatNavigationItems
      .filter((item) => item.label.toLowerCase().includes(term))
      .slice(0, 5)
  }, [query])

  useEffect(() => {
    setMobileOpen(false)
    setProfileOpen(false)
    setQuery('')
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    const firstMatch = searchSuggestions[0]
    if (firstMatch) {
      navigate(firstMatch.to)
    }
  }

  return (
    <div
      className="min-h-screen bg-slate-50"
      style={{
        background: 'radial-gradient(circle at 15% 15%, rgba(59,130,246,0.08), transparent 32%), radial-gradient(circle at 85% 5%, rgba(99,102,241,0.08), transparent 34%), #F8FAFC',
      }}
    >
      <div className="flex min-h-screen">
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onToggleCollapse={() => setCollapsed((value) => !value)}
          onClose={() => setMobileOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur">
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileOpen(true)}
                    className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:bg-gray-100 lg:hidden"
                    aria-label="Open menu"
                  >
                    <Menu size={18} />
                  </button>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Recruiter dashboard</p>
                    <h1 className="text-xl font-semibold text-slate-900">{pageMeta.title}</h1>
                    <p className="hidden text-sm text-slate-500 md:block">{pageMeta.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/notifications')}
                    className="relative rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:bg-gray-100"
                    aria-label="Open notifications"
                  >
                    <Bell size={18} />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500" />
                  </button>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setProfileOpen((value) => !value)}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:bg-gray-100"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 text-xs font-semibold text-white">
                        {(user?.fullName || user?.email || 'R').slice(0, 1).toUpperCase()}
                      </div>
                      <div className="hidden text-left sm:block">
                        <p className="text-sm font-semibold text-slate-900">{user?.fullName || 'Recruiter'}</p>
                        <p className="text-xs text-slate-500">Hiring team</p>
                      </div>
                      <ChevronDown size={16} className="text-slate-400" />
                    </button>

                    <AnimatePresence>
                      {profileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
                        >
                          <button
                            type="button"
                            onClick={() => navigate('/dashboard/settings')}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-gray-100"
                          >
                            <Settings size={15} /> Settings
                          </button>
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                          >
                            <LogOut size={15} /> Logout
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="relative">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search menu items, applicants, or reports"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </form>

                {searchSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                    {searchSuggestions.map((item) => (
                      <button
                        key={item.to}
                        type="button"
                        onClick={() => navigate(item.to)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <span>{item.label}</span>
                        <span className="text-xs text-slate-400">open</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
