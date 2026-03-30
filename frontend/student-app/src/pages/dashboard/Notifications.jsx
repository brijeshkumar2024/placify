import { useEffect, useState } from 'react'
import { Bell, AlertTriangle, Clock } from 'lucide-react'
import { notificationApi } from '../../services/api'

const typeStyles = {
  info: 'bg-blue-50 text-blue-700 border-blue-100',
  warning: 'bg-amber-50 text-amber-700 border-amber-100',
  urgent: 'bg-red-50 text-red-700 border-red-100',
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

  const badge = (type) => typeStyles[type] || typeStyles.info
  const expiryText = (expiry) => {
    if (!expiry) return 'No expiry'
    const diff = new Date(expiry).getTime() - Date.now()
    if (diff <= 0) return 'Expired'
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return `${days} day${days !== 1 ? 's' : ''} left`
  }

  if (loading) return <div className="p-8 text-gray-500">Loading notifications…</div>
  if (error) return (
    <div className="p-8">
      <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2">
        <AlertTriangle size={16} /> {error}
        <button onClick={load} className="ml-auto text-blue-600 text-xs font-medium hover:underline">Retry</button>
      </div>
    </div>
  )

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-2 mb-4">
        <Bell size={20} className="text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-900">Notifications</h2>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No notifications yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map(n => (
            <div key={n.id} className="border border-gray-100 rounded-xl p-4 flex gap-3 items-start bg-white">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${badge(n.type)}`}>
                {n.type}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                <p className="text-sm text-gray-600">{n.message}</p>
                <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                  <Clock size={12}/> {expiryText(n.expiryDate)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
