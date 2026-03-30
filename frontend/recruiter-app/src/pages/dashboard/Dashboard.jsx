import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Briefcase, Users, CheckCircle, TrendingUp, ArrowRight,
  Star, Sparkles, Clock, Activity
} from 'lucide-react'
import { jobApi } from '../../services/api'
import useAuthStore from '../../store/authStore'

const daysSince = (date) => {
  if (!date) return 'New'
  const diff = Math.ceil((new Date() - new Date(date)) / (1000 * 60 * 60 * 24))
  return diff <= 1 ? 'Today' : `${diff}d ago`
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
    if (!recruiterId) return
    Promise.all([
      jobApi.getRecruiterJobs(recruiterId, null),
      jobApi.getRecruiterStats(recruiterId)
    ])
      .then(([jobsRes, statsRes]) => {
        setJobs(jobsRes.data.data || [])
        setStats(statsRes.data.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const cards = [
    { label: 'Jobs posted', value: stats?.totalJobs ?? jobs.length, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50', accent: 'from-indigo-500/15 to-indigo-200/40', to: '/dashboard/my-jobs' },
    { label: 'Total applicants', value: stats?.totalApplicants ?? jobs.reduce((a, j) => a + (j.applicantCount || 0), 0), icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', accent: 'from-emerald-400/15 to-emerald-100/35', to: '/dashboard/my-jobs' },
    { label: 'Selection rate', value: `${(stats?.selectionRate ?? 0).toFixed(1)}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', accent: 'from-purple-500/15 to-purple-100/35', to: '/dashboard' },
    { label: 'Interviews', value: stats?.funnel?.interview ?? 0, icon: CheckCircle, color: 'text-amber-600', bg: 'bg-amber-50', accent: 'from-amber-400/20 to-amber-100/40', to: '/dashboard/my-jobs' },
  ]

  const recentActivity = useMemo(() => {
    if (!jobs.length) return []
    return jobs
      .slice()
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5)
      .map(job => ({
        title: job.title,
        company: job.company,
        count: job.applicantCount || 0,
        time: daysSince(job.createdAt),
      }))
  }, [jobs])

  return (
    <div className="p-8 space-y-7">

      {/* Hero */}
      <div className="glass-card lift overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-85" />
        <div className="absolute inset-0 backdrop-blur-sm" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-7">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-white/80 text-indigo-600 shadow">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="text-sm text-white/80">Recruitment overview</p>
              <h2 className="text-2xl md:text-3xl font-semibold text-white drop-shadow-sm">
                Good morning, {name} 👋
              </h2>
              <p className="text-white/80 mt-1 text-sm max-w-xl">
                Track funnel health, push new roles, and stay synced with applicants.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard/post-job')}
              className="btn-premium shadow-xl"
            >
              Post a job <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/dashboard/my-jobs')}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-indigo-700 bg-white/85 border border-white/70 hover:border-white transition shadow"
            >
              View applicants
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg, accent, to }) => (
          <div
            key={label}
            onClick={() => navigate(to)}
            className="glass-card lift relative overflow-hidden px-4 py-5 cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-95 group"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-95 group-hover:opacity-100 transition`} />
            <div className="relative flex flex-col gap-2 w-full h-full">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon size={20} className={color} />
              </div>
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
              <p className="text-sm text-gray-600">{label}</p>
              <span className="absolute top-4 right-4 text-gray-600 opacity-50 group-hover:opacity-100 transition-all">→</span>
            </div>
            <div className="absolute inset-0" />
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Recent jobs */}
        <div className="col-span-2 glass-card lift p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent job postings</h3>
            <button onClick={() => navigate('/dashboard/my-jobs')}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </button>
          </div>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : jobs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400 text-sm mb-3">No jobs posted yet</p>
              <button onClick={() => navigate('/dashboard/post-job')}
                className="btn-premium text-sm px-4 py-2.5">
                Post your first job
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, 4).map(job => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-white/80 transition-all cursor-pointer group shadow-sm"
                  onClick={() => navigate(`/dashboard/applicants/${job.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-semibold text-indigo-600 text-sm shadow-inner">
                      {job.company?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{job.title}</p>
                      <p className="text-xs text-gray-500">{job.company} · {job.location || 'Remote'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-medium text-emerald-600">{job.applicantCount || 0} applicants</p>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Clock size={10} /> {daysSince(job.createdAt)}
                      </p>
                    </div>
                    <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-semibold">
                      {job.status || 'ACTIVE'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions + activity */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Quick actions</h3>
            {[
              { label: 'Post a new job', desc: 'Add a fresh opening in seconds', action: () => navigate('/dashboard/post-job'), color: 'from-indigo-500 to-purple-500' },
              { label: 'View all applicants', desc: 'See candidate pipelines', action: () => navigate('/dashboard/my-jobs'), color: 'from-emerald-500 to-teal-400' },
            ].map(({ label, desc, action, color }) => (
              <button
                key={label}
                onClick={action}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/60 bg-white/70 hover:border-indigo-100 hover:bg-white transition-all text-left lift"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} text-white flex items-center justify-center`}>
                  <ArrowRight size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Activity */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={16} className="text-indigo-600" />
              <h3 className="font-semibold text-gray-900">Latest activity</h3>
            </div>
            {!recentActivity.length ? (
              <p className="text-sm text-gray-500">Activity shows up once you post roles.</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((a, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {a.title} <span className="text-gray-500 font-normal">· {a.company}</span>
                      </p>
                      <p className="text-xs text-gray-500">{a.count} applicants · {a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="glass-card lift p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-amber-500" />
            <h3 className="font-semibold text-gray-900">Top skills among applicants</h3>
          </div>
          <span className="text-xs text-gray-500">Live from applications</span>
        </div>
        {!stats?.topSkills?.length ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-inner mb-3">
              <Star size={20} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">No skill data yet</p>
            <p className="text-xs text-gray-400 mt-1">Skills appear after applicants submit profiles.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(() => {
              const max = Math.max(...stats.topSkills.map(s => s.count))
              return stats.topSkills.map((s, i) => (
                <div key={s.skill}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-400 w-4">{i + 1}</span>
                      <Star size={14} className="text-amber-400" />
                      <span className="text-sm font-medium text-gray-800">{s.skill}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">{s.count} applicant{s.count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-700"
                      style={{ width: `${(s.count / max) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
