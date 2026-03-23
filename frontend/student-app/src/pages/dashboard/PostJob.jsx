import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { jobApi } from '../../services/api'
import { CheckCircle } from 'lucide-react'

const allSkills = ['Java', 'Python', 'C++', 'JavaScript', 'React', 'Spring Boot', 'DSA', 'System Design', 'SQL', 'MongoDB', 'AWS', 'Docker', 'Node.js', 'OOP', 'Communication']
const branches = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil']

export default function PostJob() {
  const navigate = useNavigate()
  const [selectedSkills, setSelectedSkills] = useState([])
  const [selectedBranches, setSelectedBranches] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm()

  const toggleSkill = (s) => setSelectedSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  const toggleBranch = (b) => setSelectedBranches(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])

  const onSubmit = async (data) => {
    setLoading(true); setError('')
    try {
      await jobApi.createJob({
        title: data.title,
        company: data.company,
        description: data.description,
        location: data.location,
        ctc: data.ctc,
        jobType: data.jobType,
        minCgpa: parseFloat(data.minCgpa) || 6.0,
        eligibleBranches: selectedBranches,
        graduationYear: parseInt(data.graduationYear) || 2026,
        requiredSkills: selectedSkills,
        maxApplicants: parseInt(data.maxApplicants) || 100,
        deadline: new Date(data.deadline).toISOString(),
      })
      setSuccess(true)
      setTimeout(() => navigate('/dashboard/my-jobs'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job')
    } finally { setLoading(false) }
  }

  if (success) return (
    <div className="p-8 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Job posted successfully!</h2>
        <p className="text-gray-500">Redirecting to your jobs...</p>
      </div>
    </div>
  )

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Post a new job</h2>
        <p className="text-gray-500 text-sm mt-1">Fill in the details — students will see this immediately</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Basic details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Job title</label>
              <input placeholder="Software Engineer, SDE-1..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('title', { required: 'Job title is required' })} />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company name</label>
              <input placeholder="Google, Microsoft..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('company', { required: 'Company name is required' })} />
              {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
              <input placeholder="Bangalore, Hyderabad, Remote..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('location', { required: true })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">CTC offered</label>
              <input placeholder="12 LPA, 8-12 LPA..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('ctc', { required: true })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Job type</label>
              <select className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                {...register('jobType')}>
                <option>Full-time</option>
                <option>Internship</option>
                <option>Part-time</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Application deadline</label>
              <input type="date"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('deadline', { required: true })} />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Job description</label>
            <textarea rows={4} placeholder="Describe the role, responsibilities, and what you are looking for..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              {...register('description', { required: true })} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Eligibility criteria</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Min. CGPA</label>
              <input type="number" step="0.1" min="0" max="10" placeholder="6.5"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('minCgpa')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Graduation year</label>
              <select className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                {...register('graduationYear')}>
                <option>2025</option>
                <option>2026</option>
                <option>2027</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Max applicants</label>
              <input type="number" placeholder="100"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('maxApplicants')} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Eligible branches</label>
            <div className="flex flex-wrap gap-2">
              {branches.map(b => (
                <button key={b} type="button" onClick={() => toggleBranch(b)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    selectedBranches.includes(b) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}>{b}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Required skills</h3>
          <p className="text-sm text-gray-500 mb-4">Select skills students need for this role</p>
          <div className="flex flex-wrap gap-2">
            {allSkills.map(s => (
              <button key={s} type="button" onClick={() => toggleSkill(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  selectedSkills.includes(s) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}>{s}</button>
            ))}
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>}

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/dashboard')}
            className="px-6 py-3 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-xl transition-all">
            {loading ? 'Posting job...' : 'Post job — students will see it immediately'}
          </button>
        </div>
      </form>
    </div>
  )
}
