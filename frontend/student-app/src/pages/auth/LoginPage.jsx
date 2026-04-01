import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { authApi } from '../../services/api'
import useAuthStore from '../../store/authStore'
import AuthBackground from '../../components/auth/AuthBackground'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Users, Award, TrendingUp, Zap } from 'lucide-react'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
})

const PERKS = [
  { icon: Zap,        text: 'AI-powered job matching' },
  { icon: TrendingUp, text: 'Real-time placement analytics' },
  { icon: Award,      text: 'Verified campus drives' },
  { icon: Users,      text: '10,000+ students placed' },
]

export default function LoginPage() {
  const navigate  = useNavigate()
  const login     = useAuthStore((s) => s.login)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email, password }) => {
    setLoading(true); setError('')
    try {
      const response = await authApi.login({ email, password })
      login(response.data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020408] text-white">
      <AuthBackground />

      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">

        {/* ── LEFT PANEL ────────────────────────────────────────────────── */}
        <div className="hidden lg:flex flex-1 flex-col justify-center px-16 xl:px-24 py-20 border-r border-white/5">

          {/* Animated Placify logo */}
          <motion.div {...fadeUp(0.1)} className="mb-14">
            <motion.span
              className="text-5xl xl:text-6xl font-black tracking-tight"
              style={{
                background: 'linear-gradient(90deg, #818cf8, #a78bfa, #60a5fa, #818cf8)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              Placify
            </motion.span>
          </motion.div>

          {/* Badge */}
          <motion.div {...fadeUp(0.2)} className="mb-5">
            <span className="trust-badge">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-300 font-medium">Trusted by 10,000+ students</span>
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            {...fadeUp(0.3)}
            className="text-4xl xl:text-5xl font-black leading-tight mb-5 tracking-tight"
          >
            <span className="text-white">Welcome back to</span>
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #60a5fa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              your career hub
            </span>
          </motion.h2>

          {/* Subtext */}
          <motion.p {...fadeUp(0.4)} className="text-slate-300 text-base leading-relaxed mb-10 max-w-sm">
            Pick up right where you left off. Your personalized dashboard, job matches,
            and applications are waiting.
          </motion.p>

          {/* Perks */}
          <motion.div {...fadeUp(0.5)} className="space-y-3">
            {PERKS.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-500/12 border border-indigo-500/25 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-sm font-medium text-slate-300">{text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT FORM ────────────────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center px-6 py-16 lg:py-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md"
          >
            {/* Mobile: animated logo */}
            <div className="lg:hidden text-center mb-8">
              <motion.span
                className="text-4xl font-black"
                style={{
                  background: 'linear-gradient(90deg, #818cf8, #a78bfa, #60a5fa, #818cf8)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              >
                Placify
              </motion.span>
            </div>

            <div className="gradient-border">
              <div className="glass-card-glow rounded-3xl p-8 lg:p-10">

                <div className="mb-7">
                  <h2 className="text-2xl font-bold text-white mb-1.5">Sign in</h2>
                  <p className="text-slate-300 text-sm">Access your Placify account</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-2">
                      Email
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
                          className="text-red-400 text-xs mt-1.5 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />{errors.email.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-widest">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => navigate('/forgot-password')}
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-semibold"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        placeholder="Enter your password"
                        className="input-premium pr-12"
                        {...register('password', {
                          required: 'Password is required',
                          minLength: { value: 6, message: 'Minimum 6 characters' }
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
                    <AnimatePresence>
                      {errors.password && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="text-red-400 text-xs mt-1.5 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />{errors.password.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

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
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="btn-gradient flex items-center justify-center gap-2 mt-2"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <><span className="spinner" /><span>Signing in...</span></>
                    ) : (
                      <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
                    )}
                  </motion.button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-white/6" />
                  <span className="text-xs text-slate-500 font-medium">New to Placify?</span>
                  <div className="flex-1 h-px bg-white/6" />
                </div>

                <motion.button
                  onClick={() => navigate('/')}
                  className="w-full py-3 rounded-[14px] text-sm font-semibold text-slate-200 border border-white/10 bg-white/4 hover:bg-white/8 hover:border-white/20 transition-all duration-200"
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.995 }}
                >
                  Create an account
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
