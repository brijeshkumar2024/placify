import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../../services/api'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = useMemo(() => searchParams.get('token') || '', [searchParams])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ newPassword }) => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await authApi.resetPassword(token, newPassword)
      setSuccess('Password updated successfully. You can now sign in.')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Plac<span className="text-blue-600">ify</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Set a new password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Reset password</h2>
          <p className="text-gray-500 text-sm mb-6">Enter a new password for your account.</p>

          {!token ? (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-700 text-sm">
              Reset token is missing. Please request a new reset link.
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  {...register('newPassword', { required: 'New password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
                />
                {errors.newPassword && <p className="text-red-500 text-xs mt-1.5">{errors.newPassword.message}</p>}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-xl text-sm transition-all duration-200"
              >
                {loading ? 'Updating...' : 'Update password'}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-gray-400 mt-4">
            <a href="/login" className="text-blue-600 font-medium hover:underline">Back to login</a>
          </p>
        </div>
      </div>
    </div>
  )
}

