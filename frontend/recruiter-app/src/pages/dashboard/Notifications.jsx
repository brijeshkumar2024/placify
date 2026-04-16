import { useEffect, useState } from 'react'
import { AlertTriangle, Bell, Clock, MessageSquare, RefreshCw } from 'lucide-react'
import { notificationApi } from '../../services/api'

const TYPE_BADGE = {
  info:    'bg-blue-50 text-blue-700 border border-blue-100',
  warning: 'bg-amber-50 text-amber-700 border border-amber-100',
  urgent:  'bg-red-50 text-red-700 border border-red-100',
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
      .then(res => setItems(res.data?.data || []))
      .catch(() => setError('Could not load notifications'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <div className="glass-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-50 p-2.5 text-blue-600">
            <MessageSquare size={18} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-500">Platform announcements and drive updates from your TPO.</p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 shadow-sm transition hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40"
          title="Refresh"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertTriangle size={15} /> {error}
          <button onClick={load} className="ml-auto text-xs font-medium text-blue-600 hover:underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 py-8 text-sm text-gray-400">
          <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          Loading notifications…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-10 text-center text-sm text-gray-400">
          <Bell size={28} className="mx-auto mb-3 opacity-30" />
          No notifications yet. Your TPO will publish updates here.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(n => (
            <div key={n.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-start gap-3">
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${TYPE_BADGE[n.type] ?? TYPE_BADGE.info}`}>
                  {n.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                  <p className="mt-0.5 text-sm text-gray-500">{n.message}</p>
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-400">
                    <Clock size={11} /> {expiryText(n.expiryDate)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
