import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, Users, CheckCircle, TrendingUp, ArrowRight } from 'lucide-react'
import { jobApi } from '../../services/api'
import useAuthStore from '../../store/authStore'

export default function Dashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const name = user?.email?.split('@')[0] || 'Recruiter'

  useEffect(() => {
    jobApi.getAllJobs()
      .then(res => setJobs(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: 'Jobs posted', value: jobs.length, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total applicants', value: jobs.reduce((a, j) => a + (j.applicantCount || 0), 0), icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active drives', value: jobs.filter(j => j.status === 'ACTIVE').length, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Offers made', value: 0, icon: CheckCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">Good morning, {name} 👋</h2>
        <p className="text-gray-500 mt-1 text-sm">Here's your recruitment overview</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900">Recent job postings</h3>
            <button onClick={() => navigate('/dashboard/my-jobs')}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </button>
          </div>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm mb-3">No jobs posted yet</p>
              <button onClick={() => navigate('/dashboard/post-job')}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all">
                Post your first job
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, 4).map(job => (
                <div key={job.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                  onClick={() => navigate(`/dashboard/applicants/${job.id}`)}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center font-semibold text-blue-700 text-sm">
                      {job.company?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{job.title}</p>
                      <p className="text-xs text-gray-500">{job.applicantCount || 0} applicants</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-5">Quick actions</h3>
          <div className="space-y-3">
            {[
              { label: 'Post a new job', desc: 'Add a new job opening for students', action: () => navigate('/dashboard/post-job'), color: 'bg-blue-600' },
              { label: 'View all applicants', desc: 'See who applied to your jobs', action: () => navigate('/dashboard/my-jobs'), color: 'bg-purple-600' },
            ].map(({ label, desc, action, color }) => (
              <button key={label} onClick={action}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all text-left">
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <ArrowRight size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
