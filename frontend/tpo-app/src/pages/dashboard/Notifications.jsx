import { useEffect, useState } from 'react'
import { BellRing, AlertTriangle, Loader2 } from 'lucide-react'
import { notificationApi } from '../../services/api'

const typeStyles = {
  info: 'bg-blue-50 text-blue-700 border-blue-100',
  warning: 'bg-amber-50 text-amber-700 border-amber-100',
  urgent: 'bg-red-50 text-red-700 border-red-100',
}

export default function Notifications() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'info',
    audience: 'all',
    durationDays: 7,
  })

  const load = () => {
    setLoading(true)
    setError('')
    notificationApi.listForStudents()
      .then(res => setItems(res.data?.data || []))
      .catch(() => setError('Could not load notifications'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const publish = () => {
    setCreating(true)
    setError('')
    notificationApi.create(form)
      .then(() => {
        setForm({ title: '', message: '', type: 'info', audience: 'all', durationDays: 7 })
        load()
      })
      .catch(err => setError(err.response?.data?.message || 'Publish failed'))
      .finally(() => setCreating(false))
  }

  const badge = (type) => typeStyles[type] || typeStyles.info
  const expiryText = (expiry) => {
    if (!expiry) return 'No expiry'
    const diff = new Date(expiry).getTime() - Date.now()
    if (diff <= 0) return 'Expired'
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return `${days} day${days !== 1 ? 's' : ''} left`
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2"><BellRing size={20}/> Notifications</h2>
          <p className="text-sm text-gray-500">Create and publish updates for students</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
          <button onClick={load} className="ml-auto text-blue-600 text-xs font-medium hover:underline">Retry</button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Create notification</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Title"
            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}/>
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="urgent">Urgent</option>
          </select>
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })}>
            <option value="all">All students</option>
            <option value="branch:CSE">Branch: CSE</option>
            <option value="branch:IT">Branch: IT</option>
            <option value="year:2026">Year: 2026</option>
          </select>
          <input type="number" min={1} max={60} className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={form.durationDays} onChange={e => setForm({ ...form, durationDays: Number(e.target.value) })} />
        </div>
        <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3"
          rows={3} placeholder="Message" value={form.message}
          onChange={e => setForm({ ...form, message: e.target.value })}/>
        <button
          onClick={publish}
          disabled={creating || !form.title || !form.message}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg flex items-center gap-2"
        >
          {creating ? <Loader2 size={16} className="animate-spin" /> : 'Publish'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Published notifications</h3>
        {loading ? (
          <div className="text-gray-500 text-sm">Loading…</div>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-400">No active notifications</p>
        ) : (
          <div className="space-y-3">
            {items.map(n => (
              <div key={n.id} className="border border-gray-100 rounded-xl p-4 flex gap-3 items-start">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${badge(n.type)}`}>
                  {n.type}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                  <p className="text-sm text-gray-600">{n.message}</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Audience: {n.audience} · {expiryText(n.expiryDate)}
                  </p>
                </div>
                <button
                  onClick={() => notificationApi.delete(n.id).then(load)}
                  className="text-[11px] text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
