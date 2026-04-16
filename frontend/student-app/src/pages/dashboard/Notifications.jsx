import { useEffect, useState } from 'react'
import { Bell, AlertTriangle, Clock, CheckCheck, RefreshCw } from 'lucide-react'
import { notificationApi } from '../../services/api'

const typeStyles = {
  info:    'bg-blue-50 text-blue-700 border-blue-100',
  warning: 'bg-amber-50 text-amber-700 border-amber-100',
  urgent:  'bg-red-50 text-red-700 border-red-100',
}

function expiryText(expiry) {
  if (!expiry) return 'No expiry'
  const diff = new Date(expiry).getTime() - Date.now()
  if (diff <= 0) return 'Expired'
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return `${days} day${days !== 1 ? 's' : ''} left`
}

export default function Notifications() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    notificationApi.list()
      .then(res => {
        const list = res.data?.data || []
        setItems(list)
        // Mark all as read once the page is viewed
        const unreadIds = list.filter(n => !n.read).map(n => n.id)
        if (unreadIds.length > 0) notificationApi.markAllRead(unreadIds)
      })
      .catch(() => setError('Could not load notifications'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const unreadCount = items.filter(n => !n.read).length

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell size={22} className="text-indigo-600" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-sm text-indigo-600 font-medium">{unreadCount} unread</p>
            )}
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-40"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertTriangle size={15} /> {error}
          <button onClick={load} className="ml-auto text-blue-600 text-xs font-medium hover:underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 text-sm text-gray-400 py-10">
          <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          Loading notifications…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-12 text-center">
          <Bell size={28} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500">No notifications yet.</p>
          <p className="text-xs text-gray-400 mt-1">Your TPO will publish updates here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(n => (
            <div
              key={n.id}
              className={`rounded-2xl border p-4 flex gap-3 items-start transition-all ${
                n.read
                  ? 'bg-white border-gray-100'
                  : 'bg-indigo-50/40 border-indigo-100 shadow-sm'
              }`}
            >
              {!n.read && (
                <div className="mt-1.5 w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
              )}
              <span className={`text-xs font-semibold px-2 py-1 rounded-full border flex-shrink-0 ${typeStyles[n.type] || typeStyles.info}`}>
                {n.type}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${n.read ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</p>
                <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                  <Clock size={11} /> {expiryText(n.expiryDate)}
                  {n.read && <span className="ml-2 flex items-center gap-0.5 text-gray-300"><CheckCheck size={11} /> Read</span>}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
