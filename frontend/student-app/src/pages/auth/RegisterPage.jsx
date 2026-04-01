import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { authApi, userApi } from '../../services/api'
import useAuthStore from '../../store/authStore'
import { mergeAuthUser } from '../../utils/auth'
import AuthBackground from '../../components/auth/AuthBackground'
import { Mail, User, Hash, Lock, Eye, EyeOff, ArrowLeft, Rocket } from 'lucide-react'

const fieldVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
}

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
          <motion.div
            key={i}
            className={`flex-1 h-1 rounded-full transition-all duration-300 ${i < score ? colors[score - 1] : 'bg-white/8'}`}
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: i * 0.05 }}
          />
        ))}
      </div>
      <p className={`text-xs ${score <= 1 ? 'text-red-400' : score === 2 ? 'text-orange-400' : score === 3 ? 'text-yellow-400' : 'text-emerald-400'}`}>
        {labels[score - 1] || ''}
      </p>
    </motion.div>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { verifiedEmail, setAuth, setUser, startAuthCheck, logout } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { email: verifiedEmail }
  })

  const password = watch('password', '')

  if (!verifiedEmail) { navigate('/'); return null }

  const onSubmit = async (data) => {
    setLoading(true); setError('')
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
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  const fields = [
    {
      id: 'email', label: 'College Email', icon: Mail, type: 'email',
      readOnly: true, value: verifiedEmail,
    },
    {
      id: 'fullName', label: 'Full Name', icon: User, type: 'text',
      placeholder: 'Rishi Kumar',
      rules: { required: 'Full name is required' },
      error: errors.fullName,
    },
    {
      id: 'rollNumber', label: 'Roll Number', icon: Hash, type: 'text',
      placeholder: 'CS2021001',
      rules: { required: 'Roll number is required' },
      error: errors.rollNumber,
    },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020408] text-white flex items-center justify-center px-4 py-12">
      <AuthBackground />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Back */}
          <motion.button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors group"
            whileHover={{ x: -3 }}
          >
            <ArrowLeft className="w-4 h-4 group-hover:text-indigo-400 transition-colors" />
            Back
          </motion.button>

          <div className="gradient-border">
            <div className="glass-card-glow rounded-3xl p-8 lg:p-10">

              {/* Header */}
              <div className="mb-8">
                <div className="icon-glow mb-5">
                  <Rocket className="w-6 h-6 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
                <p className="text-slate-400 text-sm">You're almost in. Fill in your details below.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                {/* Static fields */}
                {fields.map((field, i) => (
                  <motion.div key={field.id} custom={i} variants={fieldVariants} initial="hidden" animate="visible">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      {field.label}
                    </label>
                    <div className="relative group">
                      <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
                      {field.readOnly ? (
                        <input type={field.type} value={field.value} readOnly className="input-readonly" />
                      ) : (
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          className="input-premium"
                          {...register(field.id, field.rules)}
                        />
                      )}
                    </div>
                    <AnimatePresence>
                      {field.error && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-red-400" />{field.error.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}

                {/* Password field */}
                <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      className="input-premium pr-12"
                      {...register('password', {
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
                    {errors.password && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-red-400" />{errors.password.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="alert-error">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />{error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="btn-gradient flex items-center justify-center gap-2 mt-2"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <><span className="spinner" /><span>Creating account...</span></>
                    ) : (
                      <><Rocket className="w-4 h-4" /><span>Create Account</span></>
                    )}
                  </motion.button>
                </motion.div>
              </form>

              <p className="text-center text-xs text-slate-600 mt-6">
                Already have an account?{' '}
                <button onClick={() => navigate('/login')} className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
