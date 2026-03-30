import { useEffect, useMemo, useState } from 'react'
import { FileBarChart, Download, TrendingUp, Award, Users, Briefcase, AlertTriangle, Loader2 } from 'lucide-react'
import { placementApi, jobApi } from '../../services/api'

export default function Reports() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)
  const [jobs, setJobs] = useState([])
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)

  const loadData = () => {
    setLoading(true)
    setError('')
    Promise.allSettled([placementApi.getStats(), jobApi.getAllJobs()])
      .then(([statsRes, jobsRes]) => {
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data?.data || {})
        if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.data?.data || [])
        if (statsRes.status === 'rejected' && jobsRes.status === 'rejected') {
          setError('Could not load report data')
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => { setGenerating(false); setGenerated(true) }, 1200)
  }

  const parsedJobs = useMemo(() => {
    return jobs.map(j => {
      const ctcNum = typeof j.ctc === 'string' ? parseFloat(j.ctc) : Number(j.ctc || 0)
      return { ...j, ctcNum: isNaN(ctcNum) ? 0 : ctcNum }
    })
  }, [jobs])

  const reportStats = [
    { label: 'Total applications', value: stats?.totalApplications ?? '–', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Placed students', value: stats?.placedStudents ?? '–', icon: Award, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active drives', value: stats?.activeDrives ?? '–', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Avg CTC (LPA)', value: parsedJobs.length ? (parsedJobs.reduce((a, b) => a + b.ctcNum, 0) / parsedJobs.length).toFixed(1) : '–', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  const topRecruiters = useMemo(() => {
    const map = {}
    parsedJobs.forEach(j => {
      const key = j.company || 'Unknown'
      if (!map[key]) map[key] = { company: key, offers: 0, totalCtc: 0, count: 0 }
      map[key].offers += j.applicantCount || 0
      map[key].totalCtc += j.ctcNum
      map[key].count += 1
    })
    return Object.values(map)
      .map(r => ({ ...r, avgCtc: r.count ? (r.totalCtc / r.count).toFixed(1) + ' LPA' : '–' }))
      .sort((a, b) => b.offers - a.offers)
      .slice(0, 5)
  }, [parsedJobs])

  const ctcBuckets = useMemo(() => {
    const buckets = [
      { range: '0-5 LPA', min: 0, max: 5, count: 0 },
      { range: '5-10 LPA', min: 5, max: 10, count: 0 },
      { range: '10-20 LPA', min: 10, max: 20, count: 0 },
      { range: '20-30 LPA', min: 20, max: 30, count: 0 },
      { range: '30+ LPA', min: 30, max: Infinity, count: 0 },
    ]
    parsedJobs.forEach(j => {
      const bucket = buckets.find(b => j.ctcNum >= b.min && j.ctcNum < b.max)
      if (bucket) bucket.count += 1
    })
    const max = Math.max(...buckets.map(b => b.count), 1)
    return buckets.map(b => ({ ...b, pct: Math.round((b.count / max) * 100) }))
  }, [parsedJobs])

  const branchStats = [] // backend currently doesn’t expose branch-wise placement

  if (loading) return <div className="p-8 text-gray-500">Loading reports…</div>
  const errorBanner = error && (
    <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2">
      <AlertTriangle size={16} /> {error}
      <button onClick={loadData} className="ml-auto text-blue-600 text-xs font-medium hover:underline">Retry</button>
    </div>
  )

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Placement reports</h2>
          <p className="text-gray-500 text-sm mt-1">Academic year 2025-2026</p>
        </div>
        <button onClick={handleGenerate} disabled={generating}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-xl transition-all">
          {generating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {generating ? 'Generating...' : generated ? 'Download PDF' : 'Generate summary'}
        </button>
      </div>

      {errorBanner}

      {generated && (
        <div className="bg-green-50 border border-green-100 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
          <FileBarChart size={20} className="text-green-600" />
          <p className="text-sm text-green-700 font-medium">Placement report generated — Batch 2026 — ready to download</p>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-6">
        {reportStats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top recruiters</h3>
          <div className="space-y-3">
            {topRecruiters.map((r, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center font-bold text-blue-700 text-sm">
                    {r.company[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.company}</p>
                    <p className="text-xs text-gray-400">{r.avgCtc}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900">{r.offers} offers</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Branch-wise placement</h3>
          {branchStats.length === 0 ? (
            <p className="text-sm text-gray-400">Branch-level stats not available yet.</p>
          ) : (
            <div className="space-y-4">
              {branchStats.map((b, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm text-gray-700">{b.branch}</p>
                    <p className="text-sm font-semibold text-gray-900">{b.pct}%</p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${b.pct >= 75 ? 'bg-green-500' : b.pct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                      style={{ width: `${b.pct}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{b.placed} of {b.eligible} students placed</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">CTC distribution</h3>
        <div className="flex items-end gap-3 h-32">
          {ctcBuckets.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <p className="text-xs font-semibold text-gray-700">{d.count}</p>
              <div className="w-full bg-blue-100 hover:bg-blue-400 rounded-t-md transition-all"
                style={{ height: `${d.pct}%` }} />
              <p className="text-xs text-gray-400 text-center">{d.range}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
