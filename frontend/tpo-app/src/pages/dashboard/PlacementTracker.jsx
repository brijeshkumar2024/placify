import { useEffect, useState, useCallback } from 'react'
import { jobApi } from '../../services/api'
import { Users, RefreshCw, AlertTriangle, X, Briefcase, MapPin, Star, Calendar } from 'lucide-react'

const STAGES = [
  { key: 'SHORTLISTED', label: 'Shortlisted',  color: 'bg-amber-500',   light: 'bg-amber-50 border-amber-100',    text: 'text-amber-700',   dot: 'bg-amber-400'   },
  { key: 'INTERVIEW',   label: 'Interview',    color: 'bg-blue-500',    light: 'bg-blue-50 border-blue-100',      text: 'text-blue-700',    dot: 'bg-blue-500'    },
  { key: 'OFFER',       label: 'Offer',        color: 'bg-green-500',   light: 'bg-green-50 border-green-100',    text: 'text-green-700',   dot: 'bg-green-500'   },
  { key: 'HIRED',       label: 'Hired',        color: 'bg-emerald-600', light: 'bg-emerald-50 border-emerald-100',text: 'text-emerald-700', dot: 'bg-emerald-500' },
  { key: 'REJECTED',    label: 'Rejected',     color: 'bg-red-400',     light: 'bg-red-50 border-red-100',        text: 'text-red-600',     dot: 'bg-red-400'     },
  { key: 'APPLIED',     label: 'Applied',      color: 'bg-gray-400',    light: 'bg-gray-50 border-gray-200',      text: 'text-gray-600',    dot: 'bg-gray-400'    },
]

const stageOf = key => STAGES.find(s => s.key === key) || STAGES[5]

export default function PlacementTracker() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [activeStage, setActiveStage]   = useState('SHORTLISTED')
  const [lastUpdated, setLastUpdated]   = useState(null)
  const [refreshing, setRefreshing]     = useState(false)
  const [selected, setSelected]         = useState(null)   // detail modal

  const fetchData = useCallback((silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    setError(null)

    jobApi.getAllApplications()
      .then(res => {
        setApplications(res.data?.data || [])
        setLastUpdated(new Date())
      })
      .catch(() => setError('Could not load placement data. Make sure job-service is running.'))
      .finally(() => { setLoading(false); setRefreshing(false) })
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => fetchData(true), 8000)
    return () => clearInterval(interval)
  }, [fetchData])

  const grouped = STAGES.reduce((acc, s) => {
    acc[s.key] = applications.filter(a => (a.status || '').toUpperCase() === s.key)
    return acc
  }, {})

  const activeApps = grouped[activeStage] || []
  const cfg = stageOf(activeStage)
  const total = applications.length || 1

  if (loading) return (
    <div className="p-8 flex items-center gap-3 text-gray-500 text-sm">
      <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      Loading placement tracker…
    </div>
  )

  return (
    <div className="p-8 max-w-6xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Placement tracker</h2>
          <p className="text-gray-500 text-sm mt-1">
            Real-time view of every student's placement stage
            {lastUpdated && (
              <span className="ml-2 text-xs text-gray-400">
                · Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Funnel summary cards */}
      <div className="grid grid-cols-6 gap-3 mb-6">
        {STAGES.map(stage => {
          const count = (grouped[stage.key] || []).length
          return (
            <button
              key={stage.key}
              onClick={() => setActiveStage(stage.key)}
              className={`glass-card p-4 text-left transition-all hover:-translate-y-0.5 ${
                activeStage === stage.key ? 'ring-2 ring-indigo-300 shadow-lg' : ''
              }`}
            >
              <div className={`w-8 h-1.5 rounded-full ${stage.color} mb-3`} />
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stage.label}</p>
              <div className="mt-2 w-full bg-gray-100 rounded-full h-1">
                <div
                  className={`h-1 rounded-full ${stage.color} transition-all duration-700`}
                  style={{ width: `${Math.round((count / total) * 100)}%` }}
                />
              </div>
            </button>
          )
        })}
      </div>

      {/* Stage filter pills */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {STAGES.map(stage => (
          <button
            key={stage.key}
            onClick={() => setActiveStage(stage.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
              activeStage === stage.key
                ? `${stage.light} ${stage.text} shadow-sm`
                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${stage.dot}`} />
            {stage.label}
            <span className="font-bold">{(grouped[stage.key] || []).length}</span>
          </button>
        ))}
      </div>

      {/* Student list */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <span className={`w-3 h-3 rounded-full ${cfg.dot}`} />
          <h3 className="font-semibold text-gray-900">{cfg.label} students</h3>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.light} ${cfg.text}`}>
            {activeApps.length}
          </span>
        </div>

        {activeApps.length === 0 ? (
          <div className="text-center py-14">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Users size={22} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">No students in {cfg.label} stage</p>
            <p className="text-xs text-gray-400 mt-1">
              Students appear here when recruiters update their application status
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeApps.map(a => (
              <div
                key={a.id}
                onClick={() => setSelected(a)}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-white/80 transition-all cursor-pointer group"
              >
                {/* Student info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
                    {(a.studentName || '?')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{a.studentName || 'Unknown'}</p>
                    <p className="text-xs text-gray-500 truncate">{a.studentEmail || '—'}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="flex items-center gap-5 text-xs text-gray-500 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Briefcase size={12} className="text-gray-400" />
                    <span className="font-medium text-gray-700">{a.company || '—'}</span>
                  </div>
                  <span className="text-gray-400">{a.jobTitle || '—'}</span>
                  {a.ctc && <span className="text-green-600 font-medium">{a.ctc}</span>}
                  {a.studentCgpa && (
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      CGPA {a.studentCgpa}
                    </span>
                  )}
                  {a.appliedAt && (
                    <span className="text-gray-400">
                      {new Date(a.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  )}
                  <span className={`px-2.5 py-1 rounded-full font-semibold ${cfg.light} ${cfg.text}`}>
                    {cfg.label}
                  </span>
                  <span className="text-gray-300 group-hover:text-indigo-400 transition-colors">→</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100"
            onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg"
                  style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
                  {(selected.studentName || '?')[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selected.studentName || 'Unknown'}</h3>
                  <p className="text-sm text-gray-500">{selected.studentEmail || '—'}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Status badge */}
            <div className="px-6 pt-4">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${stageOf(selected.status).light} ${stageOf(selected.status).text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${stageOf(selected.status).dot}`} />
                {stageOf(selected.status).label}
              </span>
            </div>

            {/* Student details */}
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Student details</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'CGPA',    value: selected.studentCgpa ?? '—' },
                    { label: 'Fit score', value: selected.fitScore ? `${selected.fitScore}%` : '—' },
                    { label: 'Rating',  value: selected.rating ?? '—' },
                    { label: 'Applied', value: selected.appliedAt ? new Date(selected.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-xl px-4 py-3">
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              {selected.studentSkills?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.studentSkills.map(s => (
                      <span key={s} className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Company / Job details */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Job details</p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Briefcase size={14} className="text-indigo-500" />
                    <span className="text-sm font-semibold text-gray-900">{selected.company || '—'}</span>
                  </div>
                  {selected.jobTitle && (
                    <p className="text-sm text-gray-600 pl-5">{selected.jobTitle}</p>
                  )}
                  <div className="flex items-center gap-4 pl-5 text-xs text-gray-500">
                    {selected.ctc && <span className="text-green-600 font-semibold">{selected.ctc}</span>}
                    {selected.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> {selected.location}
                      </span>
                    )}
                    {selected.jobType && <span>{selected.jobType}</span>}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selected.notes && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Recruiter notes</p>
                  <p className="text-sm text-gray-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                    {selected.notes}
                  </p>
                </div>
              )}

              {selected.updatedAt && (
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar size={11} />
                  Last updated {new Date(selected.updatedAt).toLocaleString('en-IN')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
