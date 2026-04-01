import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { authApi } from '../../services/api'
import useAuthStore from '../../store/authStore'
import { Mail, ArrowRight, Sparkles, Users, Award, TrendingUp, Zap, Brain, Shield } from 'lucide-react'

const STATS = [
  { value: '10K+', label: 'Students placed',  icon: Users },
  { value: '500+', label: 'Companies',         icon: Award },
  { value: '94%',  label: 'Placement rate',    icon: TrendingUp },
]

const PILLS = [
  { icon: Brain,  label: 'AI Resume Analysis' },
  { icon: Zap,    label: 'Smart Job Matching' },
  { icon: Shield, label: 'Verified Drives' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const setVerifiedEmail = useAuthStore((s) => s.setVerifiedEmail)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email }) => {
    setLoading(true); setError('')
    try {
      await authApi.checkEmail(email)
      setVerifiedEmail(email)
      navigate('/verify-otp')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#04060f' }}>

      {/* ── BACKGROUND LAYER ──────────────────────────────────────────────── */}
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />

      {/* Blobs */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ width: 900, height: 900, top: -300, left: -300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }}
        animate={{ x: [0, 60, -30, 0], y: [0, -60, 40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute pointer-events-none"
        style={{ width: 700, height: 700, bottom: -200, right: -200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }}
        animate={{ x: [0, -50, 30, 0], y: [0, 50, -40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />
      <motion.div
        className="absolute pointer-events-none"
        style={{ width: 500, height: 500, top: '50%', left: '40%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 65%)',
          filter: 'blur(100px)',
          transform: 'translate(-50%,-50%)',
        }}
        animate={{ scale: [1, 1.2, 0.9, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
      />

      {/* ── MAIN LAYOUT ───────────────────────────────────────────────────── */}
      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">

        {/* ════════════════════════════════════════════════════════════════
            LEFT — HERO
        ════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-1 flex-col justify-center px-8 py-20 lg:px-16 xl:px-24 lg:py-0">

          {/* Top badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 flex"
          >
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2"
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)' }}>
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-xs font-semibold tracking-wide" style={{ color: '#a5b4fc' }}>
                AI-Powered Campus Placement Platform
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-black tracking-tight leading-[1.04]"
              style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', color: '#f8fafc' }}>
              Land Your
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 45%, #60a5fa 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                Dream Job
              </span>
              <br />
              <span style={{ color: 'rgba(248,250,252,0.75)' }}>with </span>
              <motion.span
                style={{
                  background: 'linear-gradient(90deg, #818cf8, #a78bfa, #60a5fa, #818cf8)',
                  backgroundSize: '250% auto',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
              >
                Placify
              </motion.span>
            </h1>
          </motion.div>

          {/* Animated underline */}
          <motion.div
            className="mt-3 mb-7 h-[3px] rounded-full"
            style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #3b82f6)' }}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '72px', opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md leading-relaxed mb-10"
            style={{ fontSize: '1.0625rem', color: '#94a3b8' }}
          >
            The intelligent placement portal that connects students with top companies
            using AI-driven matching, real-time drives, and career intelligence.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap gap-4 mb-10"
          >
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl px-5 py-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                  <Icon className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <div className="text-lg font-extrabold leading-none text-white">{value}</div>
                  <div className="mt-0.5 text-xs font-medium" style={{ color: '#64748b' }}>{label}</div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap gap-2.5"
          >
            {PILLS.map(({ icon: Icon, label }) => (
              <div key={label} className="inline-flex items-center gap-2 rounded-full px-4 py-2"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Icon className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-xs font-semibold" style={{ color: '#cbd5e1' }}>{label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            RIGHT — FORM
        ════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-1 items-center justify-center px-6 py-16 lg:py-0 lg:max-w-[520px]">
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            {/* Outer glow ring */}
            <div className="relative rounded-[28px] p-[1px]"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.7), rgba(139,92,246,0.5), rgba(59,130,246,0.7))' }}>

              {/* Card */}
              <div className="relative rounded-[27px] p-8 sm:p-10 overflow-hidden"
                style={{
                  background: 'rgba(8, 10, 20, 0.92)',
                  backdropFilter: 'blur(40px)',
                  boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 120px rgba(99,102,241,0.12)',
                }}>

                {/* Inner top glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)' }} />

                {/* Subtle inner blob */}
                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />

                {/* Header */}
                <div className="relative mb-8">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.25))', border: '1px solid rgba(99,102,241,0.4)', boxShadow: '0 0 24px rgba(99,102,241,0.25)' }}>
                    <Sparkles className="h-5 w-5 text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Get started free</h2>
                  <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
                    Enter your college email to begin. We'll verify it and get you set up in seconds.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="relative space-y-5">

                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em]"
                      style={{ color: '#94a3b8' }}>
                      College Email
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors duration-200"
                        style={{ color: '#475569' }} />
                      <input
                        type="email"
                        placeholder="yourname@college.edu.in"
                        className="input-premium"
                        style={{ fontSize: '14.5px' }}
                        {...register('email', {
                          required: 'Email is required',
                          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' }
                        })}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: '#f87171' }}>
                          <span className="inline-block h-1 w-1 flex-shrink-0 rounded-full bg-red-400" />
                          {errors.email.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', color: '#fca5a5' }}>
                        <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="btn-gradient flex w-full items-center justify-center gap-2"
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.975 }}
                  >
                    {loading ? (
                      <><span className="spinner" /><span>Checking email...</span></>
                    ) : (
                      <><span>Continue with Email</span><ArrowRight className="h-4 w-4" /></>
                    )}
                  </motion.button>
                </form>

                {/* Divider */}
                <div className="relative my-6 flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                  <span className="text-xs font-medium" style={{ color: '#475569' }}>Already have an account?</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                </div>

                {/* Sign in */}
                <motion.button
                  onClick={() => navigate('/login')}
                  className="relative w-full rounded-[14px] py-3 text-sm font-semibold transition-all duration-200"
                  style={{ color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}
                  whileHover={{ scale: 1.008, backgroundColor: 'rgba(255,255,255,0.07)' }}
                  whileTap={{ scale: 0.992 }}
                >
                  Sign in instead
                </motion.button>

                {/* Footer */}
                <p className="mt-5 text-center text-xs" style={{ color: '#334155' }}>
                  By continuing, you agree to our{' '}
                  <span className="cursor-pointer transition-colors hover:text-indigo-300" style={{ color: '#818cf8' }}>Terms</span>
                  {' '}and{' '}
                  <span className="cursor-pointer transition-colors hover:text-indigo-300" style={{ color: '#818cf8' }}>Privacy Policy</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
