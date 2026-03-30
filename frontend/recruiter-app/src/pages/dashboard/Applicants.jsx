import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, FileText, Star, Calendar, LinkIcon } from 'lucide-react'
import { jobApi } from '../../services/api'

export default function Applicants() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applicants, setApplicants] = useState([])
  const [updating, setUpdating] = useState(null)
  const [filter, setFilter] = useState('ALL')
  const [counts, setCounts] = useState({})

  useEffect(() => {
        Promise.all([
          jobApi.getJob(jobId),
          jobApi.getApplicantsByJob(jobId),
          jobApi.getApplicantCounts(jobId)
        ])
      .then(([jobRes, appRes, countRes]) => {
        setJob(jobRes.data.data)
        setApplicants(appRes.data.data || [])
        setCounts(countRes.data.data || {})
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [jobId])

  const pipeline = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'REJECTED', 'HIRED']

  const updateStatus = async (applicationId, status) => {
    setUpdating(applicationId)
    try {
      await jobApi.updateApplicationStatus({ applicationId, status })
      setApplicants(prev => prev.map(a => a.id === applicationId ? { ...a, status } : a))
    } finally {
      setUpdating(null)
    }
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-8 max-w-4xl">
      <button onClick={() => navigate('/dashboard/my-jobs')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to my jobs
      </button>

      {job && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center font-bold text-blue-700 text-lg">
              {job.company?.[0]}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
              <p className="text-gray-500 text-sm">{job.company} · {job.location} · {job.ctc}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">Applicants</h3>
            <p className="text-sm text-gray-500">
              {applicants.length} candidate{applicants.length !== 1 ? 's' : ''} for this job
            </p>
          </div>
          <div className="flex gap-2">
            {['ALL', ...pipeline].map(p => (
              <button key={p} onClick={() => setFilter(p)}
                className={`px-3 py-1.5 text-xs rounded-full border ${filter===p ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {applicants.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <User size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No applicants yet</p>
            <p className="text-gray-400 text-xs mt-1">Candidates will appear here once they apply</p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {pipeline.map(stage => (
              <div key={stage} className="bg-gray-50 rounded-xl p-3 min-w-[230px] shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-700">{stage}</p>
                  <span className="text-[11px] text-gray-500">
                    {counts?.[stage.toLowerCase()] ?? applicants.filter(a => a.status === stage).length}
                  </span>
                </div>
                <div className="space-y-2">
                  {applicants.filter(a => (filter==='ALL' || a.status===filter) && a.status === stage).map(a => (
                    <div key={a.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{a.name || 'Candidate'}</p>
                          <p className="text-xs text-gray-500 truncate">{a.email || 'N/A'}</p>
                        </div>
                        <span className="text-[11px] text-gray-500">
                          {a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 my-2">
                        {a.skills?.slice(0,3).map(s => (
                          <span key={s} className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                        {a.cgpa && <span className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full">CGPA {a.cgpa}</span>}
                        {a.matchScore && <span className="text-[11px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">Match {a.matchScore}%</span>}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        {a.resumeUrl && (
                          <a className="flex items-center gap-1 hover:underline" href={a.resumeUrl} target="_blank" rel="noreferrer">
                            <FileText size={14}/> Resume
                          </a>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        {['SHORTLISTED','INTERVIEW','REJECTED','HIRED'].map(next => (
                          <button key={next}
                            onClick={() => updateStatus(a.id, next)}
                            disabled={updating === a.id || a.status === next}
                            className={`text-[11px] px-2 py-1 rounded border transition-colors ${
                              a.status===next
                                ? 'border-green-200 text-green-700 bg-green-50'
                                : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700'
                            }`}>
                            {next}
                          </button>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <Star size={12} className="text-amber-500"/> Rating: {a.rating ?? '—'}
                        <Calendar size={12}/> Notes: {a.notes ?? '—'}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => navigate('/dashboard/interview/start', { state: { candidateId: a.id, jobId } })}
                          className="text-[11px] text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-100 flex items-center gap-1">
                          <LinkIcon size={12}/> Quick interview
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
