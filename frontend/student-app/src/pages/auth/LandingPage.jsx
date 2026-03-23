import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authApi } from '../../services/api'
import useAuthStore from '../../store/authStore'

export default function LandingPage() {
  const navigate = useNavigate()
  const setVerifiedEmail = useAuthStore((s) => s.setVerifiedEmail)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email }) => {
    setLoading(true)
    setError('')
    try {
      await authApi.checkEmail(email)
      setVerifiedEmail(email)
      navigate('/verify-otp')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Plac<span className="text-blue-600">ify</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            AI-powered campus placement portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Get started
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Enter your college email to continue
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                College email
              </label>
              <input
                type="email"
                placeholder="yourname@college.edu.in"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-xl text-sm transition-all duration-200"
            >
              {loading ? 'Sending OTP...' : 'Continue with email'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <a href="/login" className="text-blue-600 font-medium hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Only college-registered email addresses are accepted
        </p>
      </div>
    </div>
  )
}