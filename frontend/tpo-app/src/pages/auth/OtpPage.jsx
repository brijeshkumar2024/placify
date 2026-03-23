import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../services/api'
import useAuthStore from '../../store/authStore'
export default function OtpPage() {
  const navigate = useNavigate()
  const email = useAuthStore((s) => s.verifiedEmail)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const refs = useRef([])
  if (!email) { navigate('/'); return null }
  const handleChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]; next[idx] = val.slice(-1); setOtp(next)
    if (val && idx < 5) refs.current[idx + 1]?.focus()
  }
  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) refs.current[idx - 1]?.focus()
  }
  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length !== 6) { setError('Please enter all 6 digits'); return }
    setLoading(true); setError('')
    try {
      await authApi.verifyOtp(email, code)
      navigate('/register')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP')
      setOtp(['', '', '', '', '', ''])
      refs.current[0]?.focus()
    } finally { setLoading(false) }
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Plac<span className="text-blue-600">ify</span></h1>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Check your email</h2>
            <p className="text-gray-500 text-sm">OTP sent to <span className="font-medium text-gray-800">{email}</span></p>
          </div>
          <div className="flex gap-3 justify-center mb-6">
            {otp.map((digit, idx) => (
              <input key={idx} ref={(el) => (refs.current[idx] = el)}
                type="text" inputMode="numeric" maxLength={1} value={digit}
                onChange={(e) => handleChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className="w-12 h-14 text-center text-xl font-semibold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            ))}
          </div>
          {error && <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>}
          <button onClick={handleVerify} disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-xl text-sm transition-all">
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <div className="mt-4 text-center">
            <button onClick={() => navigate('/')} className="text-sm text-gray-400 hover:text-gray-600">
              ← Use a different email
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}