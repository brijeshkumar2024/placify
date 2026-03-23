import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Briefcase, TrendingUp, Award, ArrowRight, AlertTriangle } from 'lucide-react'
import { jobApi } from '../../services/api'
import useAuthStore from '../../store/authStore'

export default function Dashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const name = user?.email?.split('@')[0] || 'TPO'

  useEffect(() => {
    jobApi.getAllJobs()
      .then(res => setJobs(res.data.data || []))
      .catch(() => {})
  }, [])

  const totalApplicants = jobs.reduce((a, j) => a + (j.applicantCount || 0), 0)
  const activeJobs = jobs.filter(j => j.status === 'ACTIVE').length

  const stats = [
    { label: 'Total students', value: '248', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Companies visiting', value: jobs.length, icon: Briefcase, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Offers made', value: totalApplicants, icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Placement %', value: '68%', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  const atRiskStudents = [
    { name: 'Rahul Sharma', roll: 'CS2021045', issue: 'No applications submitted', severity: 'high' },
    { name: 'Priya Patel', roll: 'CS2021089', issue: 'Profile incomplete', severity: 'medium' },
    { name: 'Amit Kumar', roll: 'CS2021023', issue: 'Low readiness score', severity: 'medium' },
    { name: 'Sneha Rao', roll: 'CS2021067', issue: 'No mock interviews taken', severity: 'low' },
  ]

  const recentActivity = [
    { text: 'Google posted a new job — Software Engineer', time: '2 hours ago', type: 'job' },
    { text: 'Microsoft shortlisted 12 students', time: '5 hours ago', type: 'shortlist' },
    { text: 'Infosys drive registration closed', time: '1 day ago', type: 'drive' },
    { text: '3 new students registered on Placify', time: '1 day ago', type: 'student' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">Good morning, {name} 👋</h2>
        <p className="text-gray-500 mt-1 text-sm">Here is your placement command centre</p>
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

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900">Active placement drives</h3>
            <button onClick={() => navigate('/dashboard/drives')}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </button>
          </div>
          {jobs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No active drives yet</p>
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, 4).map(job => (
                <div key={job.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center font-bold text-blue-700">
                      {job.company?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{job.company}</p>
                      <p className="text-xs text-gray-500">{job.title} · {job.ctc}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{job.applicantCount || 0}</p>
                    <p className="text-xs text-gray-400">applicants</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Placement progress</h3>
          <div className="relative w-32 h-32 mx-auto my-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3"/>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2563eb" strokeWidth="3"
                strokeDasharray="68 100" strokeLinecap="round"/>
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

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle size={18} className="text-amber-500" />
            <h3 className="font-semibold text-gray-900">At-risk students</h3>
            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full ml-auto">{atRiskStudents.length} students</span>
          </div>
          <div className="space-y-3">
            {atRiskStudents.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600">
                    {s.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.issue}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  s.severity === 'high' ? 'bg-red-50 text-red-600' :
                  s.severity === 'medium' ? 'bg-amber-50 text-amber-600' :
                  'bg-gray-100 text-gray-500'
                }`}>{s.severity}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-5">Recent activity</h3>
          <div className="space-y-4">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-700">{a.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}