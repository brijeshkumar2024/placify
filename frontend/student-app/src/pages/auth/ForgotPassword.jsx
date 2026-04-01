import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { authApi } from '../../services/api'
import AuthBackground from '../../components/auth/AuthBackground'
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email }) => {
    setLoading(true); setError('')
    try {
      await authApi.forgotPassword(email)
      setSentEmail(email)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link. Try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020408] text-white flex items-center justify-center px-4">
      <AuthBackground />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors group"
            whileHover={{ x: -3 }}
          >
            <ArrowLeft className="w-4 h-4 group-hover:text-indigo-400 transition-colors" />
            Back to sign in
          </motion.button>

          <div className="gradient-border">
            <div className="glass-card-glow rounded-3xl p-8 lg:p-10">
              <AnimatePresence mode="wait">

                {/* ── FORM STATE ── */}
                {!success && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-8">
                      <div className="icon-glow mb-5">
                        <Mail className="w-6 h-6 text-indigo-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-1">Forgot password?</h2>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        No worries. Enter your college email and we'll send you a secure reset link.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          College Email
                        </label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
                          <input
                            type="email"
                            placeholder="yourname@college.edu.in"
                            className="input-premium"
                            {...register('email', {
                              required: 'Email is required',
                              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' }
                            })}
                          />
                        </div>
                        <AnimatePresence>
                          {errors.email && (
                            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-red-400" />{errors.email.message}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <AnimatePresence>
                        {error && (
                          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="alert-error">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />{error}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.button
                        type="submit"
                        disabled={loading}
                        className="btn-gradient flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {loading ? (
                          <><span className="spinner" /><span>Sending link...</span></>
                        ) : (
                          <><Send className="w-4 h-4" /><span>Send Reset Link</span></>
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                )}

                {/* ── SUCCESS STATE ── */}
                {success && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center py-4"
                  >
                    <motion.div
                      className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6"
                      animate={{ boxShadow: ['0 0 20px rgba(34,197,94,0.1)', '0 0 40px rgba(34,197,94,0.3)', '0 0 20px rgba(34,197,94,0.1)'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </motion.div>

                    <h3 className="text-xl font-bold text-white mb-2">Check your inbox</h3>
                    <p className="text-slate-400 text-sm mb-1">We sent a reset link to</p>
                    <p className="text-indigo-300 text-sm font-semibold mb-6">{sentEmail}</p>
                    <p className="text-slate-500 text-xs mb-8">
                      The link expires in 15 minutes. Check your spam folder if you don't see it.
                    </p>

                    <button
                      onClick={() => navigate('/login')}
                      className="w-full py-3 rounded-[14px] text-sm font-semibold text-slate-300 border border-white/8 bg-white/3 hover:bg-white/6 transition-all duration-200"
                    >
                      Back to sign in
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
