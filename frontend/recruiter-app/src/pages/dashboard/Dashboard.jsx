import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import { jobApi } from '../../services/api'
import useAuthStore from '../../store/authStore'

const daysSince = (date) => {
  if (!date) return 'New'
  const diff = Math.ceil((new Date() - new Date(date)) / (1000 * 60 * 60 * 24))
  return diff <= 1 ? 'Today' : `${diff}d ago`
}

const motionUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  const name = (user?.fullName || user?.email?.split('@')[0] || 'Recruiter').split(' ')[0]

  useEffect(() => {
    const recruiterId = user?.userId

    if (!recruiterId) {
      setLoading(false)
      return
    }

    setLoading(true)
    Promise.all([
      jobApi.getRecruiterJobs(recruiterId, null),
      jobApi.getRecruiterStats(recruiterId),
    ])
      .then(([jobsRes, statsRes]) => {
        setJobs(jobsRes.data?.data || [])
        setStats(statsRes.data?.data || null)
      })
      .catch(() => {
        setJobs([])
        setStats(null)
      })
      .finally(() => setLoading(false))
  }, [user?.userId])

  const totals = useMemo(() => {
    const totalApplicants = stats?.totalApplicants ?? jobs.reduce((sum, job) => sum + (job.applicantCount || 0), 0)
    const interviews = stats?.funnel?.interview ?? 0
    const offers = stats?.funnel?.hired ?? stats?.funnel?.offer ?? 0
    const activeJobs = jobs.filter((job) => job.status === 'ACTIVE').length
    return { totalApplicants, interviews, offers, activeJobs }
  }, [jobs, stats])

  const funnelData = useMemo(() => [
    { stage: 'Applicants', value: totals.totalApplicants },
    { stage: 'Shortlisted', value: stats?.funnel?.shortlisted ?? Math.round(totals.totalApplicants * 0.55) },
    { stage: 'Interview', value: totals.interviews },
    { stage: 'Offers', value: totals.offers },
  ], [stats, totals])

  const topRoles = useMemo(() => jobs
    .slice()
    .sort((first, second) => (second.applicantCount || 0) - (first.applicantCount || 0))
    .slice(0, 5)
    .map((job) => ({
      name: job.title?.slice(0, 14) || 'Role',
      applicants: job.applicantCount || 0,
    })), [jobs])

  const recentJobs = useMemo(() => jobs
    .slice()
    .sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0))
    .slice(0, 4), [jobs])

  const topSkills = stats?.topSkills || []

  return (
    <div className="space-y-6">
      <motion.section
        initial="hidden"
        animate="show"
        variants={motionUp}
        className="glass-card relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-white/15 p-3 text-white">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-sm text-blue-100">Premium recruiting workspace</p>
              <h2 className="mt-1 text-2xl font-semibold">Welcome back, {name} 👋</h2>
              <p className="mt-2 max-w-2xl text-sm text-blue-100">
                Monitor the hiring funnel, review high-intent applicants, and keep interviews moving with a polished SaaS-style control center.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate('/dashboard/post-job')} className="btn-premium border border-white/20 bg-white text-blue-700 shadow-none hover:text-blue-700">
              Post a job <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/dashboard/applicants')} className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20">
              Review applicants
            </button>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Applicants', value: totals.totalApplicants, icon: Users, tone: 'bg-blue-50 text-blue-600' },
          { label: 'Interviews Scheduled', value: totals.interviews, icon: CalendarDays, tone: 'bg-violet-50 text-violet-600' },
          { label: 'Offers Made', value: totals.offers, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-600' },
          { label: 'Active Jobs', value: totals.activeJobs, icon: Briefcase, tone: 'bg-amber-50 text-amber-600' },
        ].map(({ label, value, icon: Icon, tone }, index) => (
          <motion.div
            key={label}
            initial="hidden"
            animate="show"
            transition={{ delay: index * 0.06 }}
            variants={motionUp}
            className="glass-card rounded-2xl p-5"
          >
            <div className={`mb-3 inline-flex rounded-2xl p-2.5 ${tone}`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-semibold text-slate-900">{value}</p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <motion.div initial="hidden" animate="show" variants={motionUp} className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Hiring funnel</h3>
              <p className="text-sm text-slate-500">Built with Recharts to visualize the recruiter pipeline at a glance.</p>
            </div>
            <button onClick={() => navigate('/dashboard/analytics')} className="text-sm font-medium text-blue-600 hover:underline">
              Open insights
            </button>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="stage" stroke="#94A3B8" />
                <YAxis allowDecimals={false} stroke="#94A3B8" />
                <Tooltip cursor={{ fill: '#EFF6FF' }} />
                <Bar dataKey="value" fill="#2563EB" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial="hidden" animate="show" variants={motionUp} className="glass-card p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Top performing roles</h3>
            <p className="text-sm text-slate-500">See which openings are driving the most candidate interest.</p>
          </div>

          {topRoles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              Add a few jobs to unlock performance analytics.
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={topRoles}>
                  <defs>
                    <linearGradient id="roleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#94A3B8" />
                  <YAxis allowDecimals={false} stroke="#94A3B8" />
                  <Tooltip cursor={{ stroke: '#C7D2FE', strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="applicants" stroke="#4F46E5" strokeWidth={3} fill="url(#roleGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <motion.div initial="hidden" animate="show" variants={motionUp} className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Recent hiring activity</h3>
              <p className="text-sm text-slate-500">Your latest roles, applicant volume, and fresh pipeline movement.</p>
            </div>
            <button onClick={() => navigate('/dashboard/my-jobs')} className="text-sm font-medium text-blue-600 hover:underline">
              View all
            </button>
          </div>

          {loading ? (
            <div className="flex items-center gap-3 py-10 text-sm text-slate-500">
              <div className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
              Loading dashboard metrics…
            </div>
          ) : recentJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              No jobs posted yet. Publish your first role to populate this dashboard.
            </div>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => navigate(`/dashboard/applicants/${job.id}`)}
                  className="flex w-full items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/40"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{job.title}</p>
                    <p className="text-sm text-slate-500">{job.company} · {job.location || 'Remote'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-blue-600">{job.applicantCount || 0} applicants</p>
                    <p className="text-xs text-slate-400">{daysSince(job.createdAt)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial="hidden" animate="show" variants={motionUp} className="glass-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Top skills in demand</h3>
          </div>

          {topSkills.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              Skill intelligence appears after candidates begin applying.
            </div>
          ) : (
            <div className="space-y-4">
              {topSkills.map((skill, index) => {
                const max = Math.max(...topSkills.map((entry) => entry.count || 0), 1)
                return (
                  <div key={skill.skill}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-800">{index + 1}. {skill.skill}</span>
                      <span className="text-slate-500">{skill.count} applicants</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500"
                        style={{ width: `${((skill.count || 0) / max) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </section>
    </div>
  )
}
