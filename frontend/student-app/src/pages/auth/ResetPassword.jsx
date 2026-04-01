import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { authApi } from '../../services/api'
import AuthBackground from '../../components/auth/AuthBackground'
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, ShieldCheck, AlertTriangle } from 'lucide-react'

function PasswordStrength({ password = '' }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500']
  const labels = ['Weak', 'Fair', 'Good', 'Strong']
  if (!password) return null
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2">
      <div className="flex gap-1 mb-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i < score ? colors[score - 1] : 'bg-white/8'}`} />
        ))}
      </div>
      <p className={`text-xs ${score <= 1 ? 'text-red-400' : score === 2 ? 'text-orange-400' : score === 3 ? 'text-yellow-400' : 'text-emerald-400'}`}>
        {labels[score - 1] || ''}
      </p>
    </motion.div>
  )
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = useMemo(() => searchParams.get('token') || '', [searchParams])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('newPassword', '')

  const onSubmit = async ({ newPassword }) => {
    setLoading(true); setError('')
    try {
      await authApi.resetPassword(token, newPassword)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.')
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

                {/* ── INVALID TOKEN ── */}
                {!token && (
                  <motion.div key="invalid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
                      <AlertTriangle className="w-7 h-7 text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Invalid reset link</h3>
                    <p className="text-slate-400 text-sm mb-6">This link is missing or has expired. Please request a new one.</p>
                    <button
                      onClick={() => navigate('/forgot-password')}
                      className="btn-gradient flex items-center justify-center gap-2 mx-auto"
                      style={{ width: '100%' }}
                    >
                      Request new link
                    </button>
                  </motion.div>
                )}

                {/* ── FORM STATE ── */}
                {token && !success && (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                    <div className="mb-8">
                      <div className="icon-glow mb-5">
                        <ShieldCheck className="w-6 h-6 text-indigo-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-1">Set new password</h2>
                      <p className="text-slate-400 text-sm">Choose a strong password for your account.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          New Password
                        </label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
                          <input
                            type={showPass ? 'text' : 'password'}
                            placeholder="At least 8 characters"
                            className="input-premium pr-12"
                            {...register('newPassword', {
                              required: 'Password is required',
                              minLength: { value: 8, message: 'Minimum 8 characters' }
                            })}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <PasswordStrength password={password} />
                        <AnimatePresence>
                          {errors.newPassword && (
                            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-red-400" />{errors.newPassword.message}
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
                          <><span className="spinner" /><span>Updating password...</span></>
                        ) : (
                          <><ShieldCheck className="w-4 h-4" /><span>Update Password</span></>
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
                    <h3 className="text-xl font-bold text-white mb-2">Password updated!</h3>
                    <p className="text-slate-400 text-sm mb-6">
                      Your password has been changed successfully. Redirecting you to sign in...
                    </p>
                    <div className="flex justify-center">
                      <motion.div
                        className="h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2.5, ease: 'linear' }}
                        style={{ maxWidth: '200px' }}
                      />
                    </div>
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
