import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Award, Briefcase, CheckCircle, TrendingUp, ArrowRight, Clock, Activity, Sparkles, CircleCheck, Shield, Star } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { jobApi, userApi } from '../../services/api'

const daysLeft = (deadline) => {
  if (!deadline) return 'No deadline'
  const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
  return diff > 0 ? `${diff} days` : 'Expired'
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const name = (user?.fullName || user?.email?.split('@')[0] || 'User').split(' ')[0]
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const tasks = [
    { text: 'Upload your resume', done: false },
    { text: 'Complete skill assessment', done: false },
    { text: 'Verify college email', done: true },
  ]

  useEffect(() => {
    Promise.all([
      userApi.getProfile(),
      jobApi.getAllJobs(),
      jobApi.getMyApplications(),
    ])
      .then(([profileRes, jobsRes, appsRes]) => {
        setProfile(profileRes.data?.data || null)
        setJobs(jobsRes.data?.data || [])
        setApplications(appsRes.data?.data || [])
      })
      .catch(() => setError('Could not load live dashboard data'))
      .finally(() => setLoading(false))
  }, [])

  // real counts from placement applications
  const totalApplied = applications.length
  const roundsCleared = applications.filter(app =>
    ['SHORTLISTED', 'INTERVIEW', 'OFFER', 'HIRED'].includes(app.status)
  ).length

  const readinessScore = useMemo(() => {
    const profileScore = profile?.completionScore ?? 0
    const appScore = Math.min(40, totalApplied * 10)
    const roundScore = Math.min(20, roundsCleared * 5)
    return Math.max(10, Math.min(100, profileScore + appScore + roundScore))
  }, [profile, totalApplied, roundsCleared])

  const profileCompletion = profile?.completionScore ?? 0

  const stats = [
    { label: 'Readiness score', value: String(readinessScore), unit: '/100', color: 'text-blue-600', bg: 'bg-indigo-50', icon: Award, to: '/dashboard/analytics', accent: 'from-indigo-500/15 to-indigo-200/30' },
    { label: 'Jobs applied', value: String(totalApplied), unit: '', color: 'text-green-600', bg: 'bg-emerald-50', icon: Briefcase, to: '/dashboard/applications', accent: 'from-emerald-400/15 to-emerald-100/40' },
    { label: 'Rounds cleared', value: String(roundsCleared), unit: '', color: 'text-purple-600', bg: 'bg-purple-50', icon: CheckCircle, to: '/dashboard/applications', accent: 'from-purple-500/15 to-purple-100/30' },
    { label: 'Profile complete', value: String(profileCompletion), unit: '%', color: 'text-amber-600', bg: 'bg-amber-50', icon: TrendingUp, to: '/dashboard/profile', accent: 'from-amber-400/20 to-amber-100/40' },
  ]

  const recommendedJobs = useMemo(() => {
    return jobs
      .slice()
      .sort((a, b) => (b.fitScore || 0) - (a.fitScore || 0))
      .slice(0, 3)
      .map(job => ({
        id: job.id,
        company: job.company,
        role: job.title,
        ctc: job.ctc,
        fit: job.fitScore || 72,
        deadline: daysLeft(job.deadline),
      }))
  }, [jobs])

  if (loading) return <div className="p-8 text-gray-500">Loading dashboard...</div>
  if (error) return <div className="p-8 text-red-500">{error}</div>

  return (
    <div className="p-8 space-y-8">

      {/* Hero */}
      <div className="glass-card lift overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />
        <div className="absolute inset-0 backdrop-blur-sm" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-7">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-white/70 text-indigo-600 shadow">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="text-sm text-white/90">Welcome back</p>
              <h2 className="text-2xl md:text-3xl font-semibold text-white drop-shadow-sm">
                Good morning, {name} 👋
              </h2>
              <p className="text-white/80 mt-1 text-sm max-w-xl">
                Track your readiness, apply to drives, and stay ahead this week.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard/jobs')}
              className="btn-premium shadow-xl"
            >
              Explore jobs <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/dashboard/drives')}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-indigo-700 bg-white/80 border border-white/70 hover:border-white transition shadow"
            >
              View drives
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, unit, color, bg, icon: Icon, to, accent }) => (
          <button
            key={label}
            onClick={() => to && navigate(to)}
            className="glass-card lift w-full relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${accent}`} />
            <div className="relative flex flex-col items-center justify-center text-center gap-2 py-3">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon size={20} className={color} />
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {value}<span className="text-base font-normal text-gray-400">{unit}</span>
              </p>
              <p className="text-sm text-gray-600">{label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-3 gap-6">

        {/* Job recommendations */}
        <div className="col-span-2 glass-card lift p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900">Recommended jobs</h3>
            <button
              onClick={() => navigate('/dashboard/jobs')}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>
          {recommendedJobs.length === 0 ? (
            <div className="text-sm text-gray-500 bg-white/70 border border-dashed border-gray-200 rounded-xl p-6 text-center">
              No recommendations yet. Apply to a few roles to get better matches.
            </div>
          ) : (
            <div className="space-y-3">
              {recommendedJobs.map((job) => (
                <div key={job.company} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-white/80 transition-all cursor-pointer group shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-semibold text-indigo-600 text-sm shadow-inner">
                      {job.company[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{job.role}</p>
                      <p className="text-xs text-gray-500">{job.company} · {job.ctc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-medium text-green-600">{job.fit}% fit</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock size={10} /> {job.deadline}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate('/dashboard/jobs')}
                        className="text-xs btn-premium opacity-0 group-hover:opacity-100 transition-all"
                      >
                        Apply
                      </button>
                      <button
                        onClick={() => navigate('/dashboard/jobs')}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 bg-white/70 hover:border-indigo-200 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Readiness score */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Placement readiness</h3>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3"/>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2563eb" strokeWidth="3"
                  strokeDasharray={`${readinessScore} 100`} strokeLinecap="round"/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{readinessScore}</p>
                  <p className="text-xs text-gray-400">/ 100</p>
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${readinessScore}%` }}></div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">Complete tasks to improve your score</p>
          </div>

          {/* Pending tasks */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Pending tasks</h3>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.text} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    task.done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-gray-300'
                  }`}>
                    <CircleCheck size={14} />
                  </div>
                  <p className={`text-sm ${task.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                    {task.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Activity timeline */}
      <div className="glass-card lift p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Recent activity</h3>
          </div>
          <button
            onClick={() => navigate('/dashboard/applications')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View all <ArrowRight size={12} />
          </button>
        </div>
        {applications.length === 0 ? (
          <p className="text-sm text-gray-500">No activity yet. Start applying to see updates here.</p>
        ) : (
          <div className="space-y-4">
            {applications.slice(0, 5).map(app => {
              const title = app.jobTitle || app.title || 'Job application'
              const company = app.company || app.companyName || ''
              const ref = app.jobId || app.driveId || app.id || ''
              const shortRef = ref ? `${ref.slice(0, 8)}…` : ''
              const status = (app.status || 'APPLIED').toUpperCase()
              const date = new Date(app.appliedAt || app.createdAt || Date.now()).toLocaleDateString()
              const statusColor = {
                APPLIED: 'bg-indigo-100 text-indigo-700',
                SHORTLISTED: 'bg-amber-100 text-amber-700',
                INTERVIEW: 'bg-blue-100 text-blue-700',
                OFFER: 'bg-green-100 text-green-700',
                HIRED: 'bg-emerald-100 text-emerald-700',
                REJECTED: 'bg-red-100 text-red-700',
              }[status] || 'bg-gray-100 text-gray-700'
              return (
                <div key={app.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {title} {company && <span className="text-gray-500 font-normal">· {company}</span>}
                    </p>
                    {shortRef && (
                      <p className="text-xs text-gray-500">
                        Ref: <span className="font-medium text-gray-700">{shortRef}</span>
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`text-[11px] px-2 py-1 rounded-full font-semibold ${statusColor}`}>
                        {status}
                      </span>
                      <span className="text-[11px] text-gray-400">{date}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
