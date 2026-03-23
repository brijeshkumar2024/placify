import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User } from 'lucide-react'
import { jobApi } from '../../services/api'

export default function Applicants() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    jobApi.getJob(jobId)
      .then(res => setJob(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [jobId])

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
        <h3 className="font-semibold text-gray-900 mb-2">Applicants</h3>
        <p className="text-sm text-gray-500 mb-6">
          {job?.applicantCount || 0} student{job?.applicantCount !== 1 ? 's' : ''} applied to this job
        </p>

        {!job?.applicantCount || job.applicantCount === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <User size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No applicants yet</p>
            <p className="text-gray-400 text-xs mt-1">Students will appear here once they apply</p>
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from({ length: job.applicantCount }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
                    S{i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Student {i + 1}</p>
                    <p className="text-xs text-gray-400">Applied recently</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">Applied</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
