import { Award, Briefcase, CheckCircle, TrendingUp, ArrowRight, Clock } from 'lucide-react'
import useAuthStore from '../../store/authStore'

const stats = [
  { label: 'Readiness score', value: '72', unit: '/100', color: 'text-blue-600', bg: 'bg-blue-50', icon: Award },
  { label: 'Jobs applied', value: '4', unit: '', color: 'text-green-600', bg: 'bg-green-50', icon: Briefcase },
  { label: 'Rounds cleared', value: '2', unit: '', color: 'text-purple-600', bg: 'bg-purple-50', icon: CheckCircle },
  { label: 'Profile complete', value: '60', unit: '%', color: 'text-amber-600', bg: 'bg-amber-50', icon: TrendingUp },
]

const recentJobs = [
  { company: 'Google', role: 'Software Engineer', ctc: '45 LPA', fit: 92, deadline: '3 days' },
  { company: 'Microsoft', role: 'SDE-1', ctc: '40 LPA', fit: 88, deadline: '5 days' },
  { company: 'Amazon', role: 'SDE-1', ctc: '32 LPA', fit: 81, deadline: '7 days' },
]

const tasks = [
  { text: 'Upload your resume', done: false },
  { text: 'Complete skill assessment', done: false },
  { text: 'Verify college email', done: true },
  { text: 'Attempt 1 mock interview', done: false },
]

export default function Dashboard() {
  const { user } = useAuthStore()
  const name = user?.email?.split('@')[0] || 'Student'

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">
          Good morning, {name} 👋
        </h2>
        <p className="text-gray-500 mt-1 text-sm">
          Here's your placement overview for today
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, unit, color, bg, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-semibold text-gray-900">
              {value}<span className="text-base font-normal text-gray-400">{unit}</span>
            </p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-3 gap-6">

        {/* Job recommendations */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900">Recommended jobs</h3>
            <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {recentJobs.map((job) => (
              <div key={job.company} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-semibold text-gray-700 text-sm">
                    {job.company[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{job.role}</p>
                    <p className="text-xs text-gray-500">{job.company} · {job.ctc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-medium text-green-600">{job.fit}% fit</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock size={10} /> {job.deadline}
                    </p>
                  </div>
                  <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Readiness score */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Placement readiness</h3>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3"/>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2563eb" strokeWidth="3"
                  strokeDasharray="72 100" strokeLinecap="round"/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">72</p>
                  <p className="text-xs text-gray-400">/ 100</p>
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '72%' }}></div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">Complete tasks to improve your score</p>
          </div>

          {/* Pending tasks */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Pending tasks</h3>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.text} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    task.done ? 'bg-green-500 border-green-500' : 'border-gray-300'
                  }`}>
                    {task.done && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                      </svg>
                    )}
                  </div>
                  <p className={`text-sm ${task.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                    {task.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}