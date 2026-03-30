import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authApi, userApi } from '../../services/api'
import useAuthStore from '../../store/authStore'
import { mergeAuthUser } from '../../utils/auth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { verifiedEmail, setAuth, setUser, startAuthCheck, logout } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: verifiedEmail }
  })

  if (!verifiedEmail) {
    navigate('/')
    return null
  }

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')

    try {
      const res = await authApi.register(data)
      const { accessToken, ...authUser } = res.data.data

      setAuth(authUser, accessToken)
      startAuthCheck()

      const profileResponse = await userApi.getProfile()
      const profile = profileResponse?.data?.data || {}
      setUser(mergeAuthUser(authUser, profile))

      navigate('/dashboard', { replace: true })
    } catch (err) {
      logout({ broadcast: false })
      setError(err.response?.data?.message || 'Registration failed')
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
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Create your account</h2>
          <p className="text-gray-500 text-sm mb-6">You're almost in. Fill in your details.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Email - readonly */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">College email</label>
              <input
                type="email"
                value={verifiedEmail}
                readOnly
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Full name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
              <input
                type="text"
                placeholder="Rishi Kumar"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                {...register('fullName', { required: 'Full name is required' })}
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1.5">{errors.fullName.message}</p>}
            </div>

            {/* Roll number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Roll number</label>
              <input
                type="text"
                placeholder="CS2021001"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                {...register('rollNumber', { required: 'Roll number is required' })}
              />
              {errors.rollNumber && <p className="text-red-500 text-xs mt-1.5">{errors.rollNumber.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-12"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Minimum 8 characters' }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-xl text-sm transition-all duration-200 mt-2"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}