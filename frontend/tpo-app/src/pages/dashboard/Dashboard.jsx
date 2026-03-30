import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Briefcase, TrendingUp, Award, ArrowRight, AlertTriangle,
  Building2, Loader2, Sparkles, Activity, Clock, Shield, UserPlus
} from 'lucide-react'
import { jobApi, placementApi, authApi } from '../../services/api'
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
  const [stats, setStats] = useState(null)
  const [atRisk, setAtRisk] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [recruiterForm, setRecruiterForm] = useState({ fullName: '', email: '', password: '', company: '' })
  const [creating, setCreating] = useState(false)
  const [recruiterMsg, setRecruiterMsg] = useState('')
  const name = (user?.fullName || user?.email?.split('@')[0] || 'TPO').split(' ')[0]

  const fetchStats = () =>
    placementApi.getStats()
      .then(res => setStats(res.data.data))
      .catch(() => {})

  useEffect(() => {
    Promise.all([
      jobApi.getAllJobs(),
      placementApi.getStats(),
      placementApi.getAtRisk(),
      placementApi.getDrives(),
    ])
      .then(([jobsRes, statsRes, atRiskRes]) => {
        setJobs(jobsRes.data.data || [])
        setStats(statsRes.data.data)
        const mappedRisk = (atRiskRes.data?.data || []).map((s, idx) => ({
          id: s.id || idx,
          name: s.studentId || 'Unknown student',
          issue: s.holdReason || 'No offers yet',
          severity: s.onHold ? 'high' : 'medium',
        }))
        setAtRisk(mappedRisk)
      })
      .catch(() => setError('Could not load live data'))
      .finally(() => setLoading(false))
  }, [])

  // Poll stats every 5 seconds to pick up recruiter status changes
  useEffect(() => {
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleCreateRecruiter = () => {
    setRecruiterMsg('')
    setCreating(true)
    authApi.createRecruiter({
      fullName: recruiterForm.fullName,
      email: recruiterForm.email,
      password: recruiterForm.password,
      company: recruiterForm.company,
    })
      .then(() => {
        setRecruiterMsg('Recruiter created. Credentials shared.')
        setRecruiterForm({ fullName: '', email: '', password: '', company: '' })
      })
      .catch(err => {
        const msg = err.response?.data?.message || 'Could not create recruiter'
        setRecruiterMsg(msg)
      })
      .finally(() => setCreating(false))
  }

  const totalApplicants = jobs.reduce((a, j) => a + (j.applicantCount || 0), 0)
  const statCards = [
    { label: 'Total applications', value: stats?.totalApplications ?? '–', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', accent: 'from-indigo-500/15 to-indigo-200/40' },
    { label: 'Active drives', value: stats?.activeDrives ?? '–', icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50', accent: 'from-emerald-400/15 to-emerald-100/35', sub: stats ? `+${stats.upcomingDrives ?? 0} upcoming` : null },
    { label: 'Offers made', value: stats?.offersMade ?? '–', icon: Award, color: 'text-purple-600', bg: 'bg-purple-50', accent: 'from-purple-500/15 to-purple-100/35' },
    { label: 'At-risk students', value: stats?.atRiskStudents ?? atRisk.length ?? '–', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', accent: 'from-amber-400/20 to-amber-100/40' },
  ]

  const funnelStats = stats ? [
    { label: 'Shortlisted', value: stats.shortlistedStudents ?? 0, color: 'bg-amber-400' },
    { label: 'Interview', value: stats.interviewStudents ?? 0, color: 'bg-blue-500' },
    { label: 'Offers', value: stats.offersMade ?? 0, color: 'bg-green-500' },
    { label: 'Rejected', value: stats.rejectedStudents ?? 0, color: 'bg-red-400' },
  ] : []

  const recentActivity = useMemo(() => ([
    { text: `Active jobs: ${jobs.filter(j => j.status === 'ACTIVE').length}`, time: 'Live', type: 'job' },
    { text: `Applications today: ${totalApplicants}`, time: 'Live', type: 'shortlist' },
    { text: `At-risk students: ${atRisk.length}`, time: 'Live', type: 'drive' },
  ]), [jobs, totalApplicants, atRisk])

  return (
    <div className="p-8 space-y-7">
      {error && (
        <div className="glass-card border border-red-100/70 bg-red-50/70 text-red-700 text-sm px-4 py-3 flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

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
              <p className="text-sm text-white/80">Placement command centre</p>
              <h2 className="text-2xl md:text-3xl font-semibold text-white drop-shadow-sm">
                Good morning, {name} 👋
              </h2>
              <p className="text-white/80 mt-1 text-sm max-w-xl">
                Monitor drives, unblock at-risk students, and onboard recruiters effortlessly.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard/drives')}
              className="btn-premium shadow-xl"
            >
              View drives <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/dashboard/companies')}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-indigo-700 bg-white/85 border border-white/70 hover:border-white transition shadow"
            >
              Companies
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg, accent, sub }) => (
          <div key={label} className="glass-card lift relative overflow-hidden px-4 py-5">
            <div className={`absolute inset-0 bg-gradient-to-br ${accent}`} />
            <div className="relative flex flex-col gap-1">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon size={20} className={color} />
              </div>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
              <p className="text-sm text-gray-600">{label}</p>
              {sub && <p className="text-xs text-gray-400">{sub}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Drives */}
        <div className="col-span-2 glass-card lift p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Active placement drives</h3>
            <button onClick={() => navigate('/dashboard/drives')}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </button>
          </div>
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-8">Loading drives…</p>
          ) : jobs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No active drives yet</p>
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, 4).map(job => (
                <div key={job.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-white/80 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-indigo-600 shadow-inner">
                      {job.company?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{job.company}</p>
                      <p className="text-xs text-gray-500">{job.title} · {job.ctc}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-emerald-600">{job.applicantCount || 0} applicants</p>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1 justify-end">
                      <Clock size={10} /> {daysSince(job.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Placement progress</h3>
          <div className="relative w-32 h-32 mx-auto my-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2563eb" strokeWidth="3"
                strokeDasharray="68 100" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">68%</p>
                <p className="text-xs text-gray-400">placed</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Placed', value: '169', color: 'bg-blue-600' },
              { label: 'In process', value: '42', color: 'bg-amber-400' },
              { label: 'Not started', value: '37', color: 'bg-gray-200' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <p className="text-xs text-gray-600">{label}</p>
                </div>
                <p className="text-xs font-semibold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* At risk */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-amber-500" />
            <h3 className="font-semibold text-gray-900">At-risk students</h3>
            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full ml-auto">{atRisk.length} students</span>
          </div>
          <div className="space-y-3">
            {atRisk.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-white/70 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-xs font-semibold text-blue-700">
                    {(s.name || '').split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.issue}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  s.severity === 'high' ? 'bg-red-50 text-red-600' :
                  s.severity === 'medium' ? 'bg-amber-50 text-amber-600' :
                  'bg-gray-100 text-gray-500'
                }`}>{s.severity}</span>
              </div>
            ))}
            {!atRisk.length && <p className="text-sm text-gray-500">No one is marked at risk right now.</p>}
          </div>
        </div>

        {/* Activity */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Recent activity</h3>
          </div>
          <div className="space-y-4">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-700">{a.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Placement funnel */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Placement funnel</h3>
          </div>
          {funnelStats.length === 0 ? (
            <p className="text-sm text-gray-400">Loading funnel data…</p>
          ) : (
            <div className="space-y-3">
              {funnelStats.map(({ label, value, color }) => {
                const max = Math.max(...funnelStats.map(f => f.value), 1)
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">{label}</span>
                      <span className="text-xs font-semibold text-gray-900">{value}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`${color} h-2 rounded-full transition-all duration-700`}
                        style={{ width: `${(value / max) * 100}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recruiter creation */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <UserPlus size={18} className="text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Add recruiter</h3>
          </div>
          {recruiterMsg && (
            <div className={`mb-3 text-xs px-3 py-2 rounded-lg ${recruiterMsg.includes('created') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {recruiterMsg}
            </div>
          )}
          <div className="space-y-3">
            <input
              className="input-premium"
              placeholder="Full name"
              value={recruiterForm.fullName}
              onChange={e => setRecruiterForm({ ...recruiterForm, fullName: e.target.value })}
            />
            <input
              className="input-premium"
              placeholder="Work email"
              value={recruiterForm.email}
              onChange={e => setRecruiterForm({ ...recruiterForm, email: e.target.value })}
            />
            <input
              className="input-premium"
              placeholder="Temporary password"
              type="password"
              value={recruiterForm.password}
              onChange={e => setRecruiterForm({ ...recruiterForm, password: e.target.value })}
            />
            <input
              className="input-premium"
              placeholder="Company"
              value={recruiterForm.company}
              onChange={e => setRecruiterForm({ ...recruiterForm, company: e.target.value })}
            />
            <button
              onClick={handleCreateRecruiter}
              disabled={creating || !recruiterForm.email || !recruiterForm.password || !recruiterForm.fullName}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 btn-premium disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none"
            >
              {creating ? <Loader2 size={16} className="animate-spin" /> : 'Create recruiter'}
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1">
            <Shield size={12} /> Sends credentials instantly; recruiters can log in using this email & password.
          </p>
        </div>
      </div>
    </div>
  )
}
