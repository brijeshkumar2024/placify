import { useState, useEffect } from 'react'
import { Search, Clock, MapPin, IndianRupee, Bookmark, CheckCircle } from 'lucide-react'
import { jobApi } from '../../services/api'

const fitColor = (fit) => {
  if (fit >= 85) return 'text-green-700 bg-green-50'
  if (fit >= 70) return 'text-amber-700 bg-amber-50'
  return 'text-red-700 bg-red-50'
}

const fitLabel = (fit) => {
  if (fit >= 85) return 'Excellent fit'
  if (fit >= 70) return 'Good fit'
  return 'Partial fit'
}

const calcFit = (job) => {
  let score = 70
  if (job.minCgpa <= 7.5) score += 10
  if (job.requiredSkills?.length <= 3) score += 10
  if (job.maxApplicants >= 100) score += 5
  return Math.min(score, 99)
}

const daysLeft = (deadline) => {
  if (!deadline) return 'No deadline'
  const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
  return diff > 0 ? `${diff} days` : 'Expired'
}

export default function JobFeed() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [saved, setSaved] = useState([])
  const [applying, setApplying] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    jobApi.getAllJobs()
      .then(res => {
        const data = (res.data.data || []).map(j => ({
          ...j,
          // Backend now sends `isApplied`; keep backward compatibility if it arrives as `applied`.
          isApplied: typeof j.isApplied === 'boolean' ? j.isApplied : !!j.applied
        }))
        setJobs(data)
        if (data.length > 0) setSelected(data[0])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = jobs.filter(j => {
    const matchSearch = j.company?.toLowerCase().includes(search.toLowerCase()) ||
      j.title?.toLowerCase().includes(search.toLowerCase())
    const fit = calcFit(j)
    const matchFilter = filter === 'all' ||
      (filter === 'high' && fit >= 85) ||
      (filter === 'saved' && saved.includes(j.id))
    return matchSearch && matchFilter
  })

  const toggleSave = (id, e) => {
    e.stopPropagation()
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleApply = async (id) => {
    const job = jobs.find(j => j.id === id)
    if (job?.isApplied || applying) return
    setApplying(true)
    try {
      await jobApi.applyToJob(id)
      setJobs(prev => prev.map(j => j.id === id
        ? { ...j, isApplied: true, applicantCount: (j.applicantCount || 0) + 1 }
        : j))
      setSelected(prev => prev?.id === id
        ? { ...prev, isApplied: true, applicantCount: (prev.applicantCount || 0) + 1 }
        : prev)
    } catch (err) {
      const msg = err.response?.data?.message
      if (msg?.toLowerCase().includes('already applied')) {
        setJobs(prev => prev.map(j => j.id === id ? { ...j, isApplied: true } : j))
      }
    } finally {
      setApplying(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading jobs...</p>
      </div>
    </div>
  )

  if (jobs.length === 0) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-xl font-semibold text-gray-900 mb-2">No jobs available yet</p>
        <p className="text-gray-500 text-sm">Check back soon — recruiters are adding jobs.</p>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left panel */}
      <div className="w-96 border-r border-gray-100 flex flex-col bg-white">
        <div className="p-4 border-b border-gray-100">
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs or companies..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'high', 'saved'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {f === 'all' ? 'All jobs' : f === 'high' ? 'Best fit' : 'Saved'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filtered.map(job => {
            const fit = calcFit(job)
            return (
              <div key={job.id} onClick={() => setSelected(job)}
                className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                  selected?.id === job.id ? 'bg-blue-50 border-l-2 border-blue-600' : ''
                }`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center font-semibold text-gray-700 text-sm flex-shrink-0">
                      {job.company?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{job.title}</p>
                      <p className="text-xs text-gray-500">{job.company}</p>
                    </div>
                  </div>
                  <button onClick={(e) => toggleSave(job.id, e)}>
                    <Bookmark size={16} className={saved.includes(job.id) ? 'text-blue-600 fill-blue-600' : 'text-gray-300'} />
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${fitColor(fit)}`}>
                    {fit}% · {fitLabel(fit)}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={10} /> {daysLeft(job.deadline)}
                  </span>
                  <span className="text-xs text-gray-400">{job.ctc}</span>
                </div>
                {job.isApplied && (
                  <p className="text-xs text-green-600 font-medium mt-1.5 flex items-center gap-1">
                    <CheckCircle size={11} /> Applied
                  </p>
                )}
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">No jobs found</div>
          )}
        </div>
      </div>

      {/* Right detail panel */}
      {selected && (() => {
        const fit = calcFit(selected)
        return (
          <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
            <div className="max-w-2xl">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center font-bold text-gray-700 text-xl">
                      {selected.company?.[0]}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{selected.title}</h2>
                      <p className="text-gray-500 text-sm">{selected.company}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${fitColor(fit)}`}>
                    {fit}% fit
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-5">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-gray-400" /> {selected.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <IndianRupee size={14} className="text-gray-400" /> {selected.ctc}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-gray-400" /> Deadline in {daysLeft(selected.deadline)}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApply(selected.id)}
                    disabled={selected.isApplied || applying}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                      selected.isApplied
                        ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                        : applying
                        ? 'bg-blue-400 text-white cursor-wait'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}>
                    {selected.isApplied
                      ? '✓ Applied'
                      : applying ? 'Applying...' : 'Apply now'}
                  </button>
                  <button onClick={(e) => toggleSave(selected.id, e)}
                    className="px-4 py-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all">
                    <Bookmark size={18} className={saved.includes(selected.id) ? 'text-blue-600 fill-blue-600' : 'text-gray-400'} />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
                <h3 className="font-semibold text-gray-900 mb-3">About this role</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{selected.description}</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
                <h3 className="font-semibold text-gray-900 mb-4">Job details</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Min. CGPA', value: `${selected.minCgpa}+` },
                    { label: 'Job type', value: selected.jobType },
                    { label: 'Applicants', value: selected.applicantCount || 0 },
                    { label: 'Graduation year', value: selected.graduationYear },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">{label}</p>
                      <p className="text-sm font-medium text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Skills required</h3>
                <div className="flex flex-wrap gap-2">
                  {selected.requiredSkills?.map(skill => (
                    <span key={skill} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
