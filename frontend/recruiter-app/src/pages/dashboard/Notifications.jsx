import { Bell, CheckCircle2, MessageSquare, Sparkles } from 'lucide-react'

const notifications = [
  {
    title: '3 new applicants matched your frontend role',
    meta: '2 minutes ago',
    icon: Sparkles,
    tone: 'text-blue-600 bg-blue-50',
  },
  {
    title: 'Interview reminder: Sanya Kapoor at 4:00 PM',
    meta: 'Today',
    icon: Bell,
    tone: 'text-amber-600 bg-amber-50',
  },
  {
    title: 'Offer letter viewed by candidate',
    meta: 'Yesterday',
    icon: CheckCircle2,
    tone: 'text-emerald-600 bg-emerald-50',
  },
]

export default function Notifications() {
  return (
    <div className="glass-card p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-blue-50 p-2.5 text-blue-600">
          <MessageSquare size={18} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-500">Stay on top of applicant movement and recruiter actions.</p>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map(({ title, meta, icon: Icon, tone }) => (
          <div key={title} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start gap-3">
              <div className={`rounded-2xl p-2.5 ${tone}`}>
                <Icon size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{title}</p>
                <p className="mt-1 text-xs text-gray-500">{meta}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
