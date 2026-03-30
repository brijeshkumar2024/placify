import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { authApi } from '../../services/api'

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email }) => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await authApi.forgotPassword(email)
      setSuccess(res.data?.message || 'Check your email for the reset link.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link')
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
          <p className="text-gray-500 mt-2 text-sm">Reset your password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Forgot password</h2>
          <p className="text-gray-500 text-sm mb-6">Enter your college email to receive a reset link.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">College email</label>
              <input
                type="email"
                placeholder="yourname@college.edu.in"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
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
              {loading ? 'Sending...' : 'Send reset link'}
            </button>

            <p className="text-center text-xs text-gray-400 mt-2">
              Remembered your password?{' '}
              <a href="/login" className="text-blue-600 font-medium hover:underline">Sign in</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

