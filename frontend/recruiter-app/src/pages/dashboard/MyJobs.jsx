import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Users, MapPin, ChevronRight } from 'lucide-react'
import { jobApi } from '../../services/api'
import useAuthStore from '../../store/authStore'

const daysLeft = (deadline) => {
  if (!deadline) return 'No deadline'
  const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
  return diff > 0 ? `${diff} days left` : 'Expired'
}

export default function MyJobs() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('ALL')

  useEffect(() => {
    const recruiterId = user?.userId
    if (!recruiterId) return
    setLoading(true)
    jobApi.getRecruiterJobs(recruiterId, status === 'ALL' ? null : status)
      .then(res => setJobs(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, status])

  if (loading) return (
    <div className="p-8 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">My jobs</h2>
          <p className="text-gray-500 text-sm mt-1">{jobs.length} job{jobs.length !== 1 ? 's' : ''} posted</p>
        </div>
        <button onClick={() => navigate('/dashboard/post-job')}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all">
          + Post new job
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {['ALL', 'ACTIVE', 'CLOSED', 'DRAFT'].map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-all ${status === s ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {s}
          </button>
        ))}
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm mb-4">No jobs posted yet</p>
          <button onClick={() => navigate('/dashboard/post-job')}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all">
            Post your first job
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer"
              onClick={() => navigate(`/dashboard/applicants/${job.id}`)}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center font-bold text-blue-700 text-lg">
                    {job.company?.[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-500">{job.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    job.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>{job.status}</span>
                  <ChevronRight size={18} className="text-gray-300" />
                </div>
              </div>
              <div className="flex items-center gap-5 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-gray-400" /> {job.applicantCount || 0} applicants
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-gray-400" /> {job.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-gray-400" /> {daysLeft(job.deadline)}
                </span>
                <span className="font-medium text-gray-700">{job.ctc}</span>
              </div>
              {job.requiredSkills?.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {job.requiredSkills.slice(0, 4).map(s => (
                    <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
