import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { authApi } from '../../services/api'
import useAuthStore from '../../store/authStore'
import AuthBackground from '../../components/auth/AuthBackground'
import { Mail, ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react'

export default function OtpPage() {
  const navigate = useNavigate()
  const email = useAuthStore((s) => s.verifiedEmail)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const refs = useRef([])

  if (!email) { navigate('/'); return null }

  const handleChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[idx] = val.slice(-1)
    setOtp(next)
    if (val && idx < 5) refs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) refs.current[idx - 1]?.focus()
    if (e.key === 'ArrowLeft' && idx > 0) refs.current[idx - 1]?.focus()
    if (e.key === 'ArrowRight' && idx < 5) refs.current[idx + 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = [...otp]
    pasted.split('').forEach((ch, i) => { if (i < 6) next[i] = ch })
    setOtp(next)
    refs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length !== 6) { setError('Please enter all 6 digits'); return }
    setLoading(true); setError('')
    try {
      await authApi.verifyOtp(email, code)
      navigate('/register')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP')
      setOtp(['', '', '', '', '', ''])
      refs.current[0]?.focus()
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    setResending(true); setError('')
    try {
      await authApi.checkEmail(email)
      setOtp(['', '', '', '', '', ''])
      setResent(true)
      setTimeout(() => setResent(false), 3000)
      refs.current[0]?.focus()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend OTP')
    } finally { setResending(false) }
  }

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(b.length) + c)
  const filled = otp.filter(Boolean).length

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020408] text-white flex items-center justify-center px-4">
      <AuthBackground />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Back button */}
          <motion.button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors group"
            whileHover={{ x: -3 }}
          >
            <ArrowLeft className="w-4 h-4 group-hover:text-indigo-400 transition-colors" />
            Back to start
          </motion.button>

          <div className="gradient-border">
            <div className="glass-card-glow rounded-3xl p-8 lg:p-10">

              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  className="icon-glow mx-auto mb-5"
                  animate={{ boxShadow: ['0 0 20px rgba(99,102,241,0.2)', '0 0 40px rgba(99,102,241,0.5)', '0 0 20px rgba(99,102,241,0.2)'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Mail className="w-6 h-6 text-indigo-400" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-2">Check your inbox</h2>
                <p className="text-slate-400 text-sm">
                  We sent a 6-digit code to
                </p>
                <p className="text-indigo-300 text-sm font-semibold mt-1">{maskedEmail}</p>
              </div>

              {/* Progress bar */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 h-0.5 rounded-full"
                    animate={{ background: i < filled ? 'linear-gradient(90deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.08)' }}
                    transition={{ duration: 0.2 }}
                  />
                ))}
              </div>

              {/* OTP inputs */}
              <div className="flex gap-2.5 justify-center mb-6" onPaste={handlePaste}>
                {otp.map((digit, idx) => (
                  <motion.input
                    key={idx}
                    ref={(el) => (refs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className="otp-input"
                    placeholder="·"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                ))}
              </div>

              {/* Error / success */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="alert-error mb-4"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
                {resent && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="alert-success mb-4"
                  >
                    <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                    New code sent to your email
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Verify button */}
              <motion.button
                onClick={handleVerify}
                disabled={loading || filled < 6}
                className="btn-gradient flex items-center justify-center gap-2"
                whileHover={{ scale: filled === 6 ? 1.01 : 1 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <><span className="spinner" /><span>Verifying...</span></>
                ) : (
                  <><ShieldCheck className="w-4 h-4" /><span>Verify Code</span></>
                )}
              </motion.button>

              {/* Resend */}
              <div className="text-center mt-5">
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-400 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  {resending ? 'Sending...' : "Didn't receive it? Resend code"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
