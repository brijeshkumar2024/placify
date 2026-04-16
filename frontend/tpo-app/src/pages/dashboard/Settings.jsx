import { useState } from 'react'
import { Mail, User, Shield, GraduationCap, CheckCircle2, AlertTriangle } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { authApi } from '../../services/api'

export default function Settings() {
  const { user } = useAuthStore()
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handlePasswordReset = async () => {
    if (!user?.email) return
    setSending(true)
    setError('')
    try {
      await authApi.forgotPassword(user.email)
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send reset email. Try again.')
    } finally {
      setSending(false)
    }
  }

  const fullName = user?.fullName || user?.name || user?.email?.split('@')[0] || 'TPO Officer'
  const initials = fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your account and security preferences</p>
      </div>

      {/* Account */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Account</h3>
        <div className="flex items-center gap-4">
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center font-bold text-white text-lg flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-gray-900 truncate">{fullName}</p>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-sky-50 text-sky-700">
              <GraduationCap size={11} /> TPO
            </span>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Contact</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Email address</p>
              <p className="text-sm font-medium text-gray-900">{user?.email || '—'}</p>
            </div>
          </div>
          {(user?.college || user?.institution) && (
            <div className="flex items-center gap-3">
              <GraduationCap size={16} className="text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Institution</p>
                <p className="text-sm font-medium text-gray-900">{user.college || user.institution}</p>
              </div>
            </div>
          )}
          {user?.role && (
            <div className="flex items-center gap-3">
              <User size={16} className="text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Role</p>
                <p className="text-sm font-medium text-gray-900">{user.role}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">Security</h3>
        <p className="text-sm text-gray-500 mb-4">
          Password changes are handled via a secure email link.
        </p>

        {sent ? (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 size={16} /> Reset link sent to <span className="font-semibold">{user?.email}</span>. Check your inbox.
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertTriangle size={15} /> {error}
              </div>
            )}
            <button
              onClick={handlePasswordReset}
              disabled={sending}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50"
            >
              <Shield size={15} className="text-sky-500" />
              {sending ? 'Sending reset link…' : 'Send password reset email'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
