import { useState } from 'react'
import { Search, Filter, Clock, MapPin, IndianRupee, Bookmark, ChevronRight } from 'lucide-react'

const jobs = [
  {
    id: 1, company: 'Google', role: 'Software Engineer', location: 'Bangalore',
    ctc: '45 LPA', type: 'Full-time', fit: 92, deadline: '3 days',
    skills: ['DSA', 'System Design', 'Java'], cgpa: 7.5, applicants: 128,
    posted: '2 days ago', description: 'Join Google as a Software Engineer and work on products used by billions of people worldwide.',
  },
  {
    id: 2, company: 'Microsoft', role: 'SDE-1', location: 'Hyderabad',
    ctc: '40 LPA', type: 'Full-time', fit: 88, deadline: '5 days',
    skills: ['DSA', 'C++', 'OOP'], cgpa: 7.0, applicants: 94,
    posted: '3 days ago', description: 'Build tools and platforms that empower every person and organization on the planet.',
  },
  {
    id: 3, company: 'Amazon', role: 'SDE-1', location: 'Bangalore',
    ctc: '32 LPA', type: 'Full-time', fit: 81, deadline: '7 days',
    skills: ['DSA', 'Java', 'AWS'], cgpa: 6.5, applicants: 210,
    posted: '1 day ago', description: 'Work on Amazon\'s world-class engineering challenges at massive scale.',
  },
  {
    id: 4, company: 'Flipkart', role: 'SDE-1', location: 'Bangalore',
    ctc: '28 LPA', type: 'Full-time', fit: 78, deadline: '10 days',
    skills: ['DSA', 'Python', 'SQL'], cgpa: 6.0, applicants: 176,
    posted: '4 days ago', description: 'Build India\'s largest e-commerce platform and serve millions of customers.',
  },
  {
    id: 5, company: 'Infosys', role: 'Systems Engineer', location: 'Pune',
    ctc: '8 LPA', type: 'Full-time', fit: 95, deadline: '15 days',
    skills: ['Java', 'SQL', 'Communication'], cgpa: 6.0, applicants: 520,
    posted: '5 days ago', description: 'Join Infosys as a Systems Engineer and build enterprise solutions for global clients.',
  },
  {
    id: 6, company: 'Razorpay', role: 'Backend Engineer', location: 'Bangalore',
    ctc: '22 LPA', type: 'Full-time', fit: 74, deadline: '8 days',
    skills: ['Node.js', 'DSA', 'Databases'], cgpa: 7.0, applicants: 88,
    posted: '2 days ago', description: 'Help power payments for hundreds of thousands of businesses across India.',
  },
]

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

export default function JobFeed() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(jobs[0])
  const [saved, setSaved] = useState([])
  const [applied, setApplied] = useState([])
  const [filter, setFilter] = useState('all')

  const filtered = jobs.filter(j => {
    const matchSearch = j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.role.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' ||
      (filter === 'high' && j.fit >= 85) ||
      (filter === 'saved' && saved.includes(j.id))
    return matchSearch && matchFilter
  })

  const toggleSave = (id, e) => {
    e.stopPropagation()
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleApply = (id) => {
    if (!applied.includes(id)) setApplied(prev => [...prev, id])
  }

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Left panel — job list */}
      <div className="w-96 border-r border-gray-100 flex flex-col bg-white">

        {/* Search + filter */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs or companies..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'high', 'saved'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'All jobs' : f === 'high' ? 'Best fit' : 'Saved'}
              </button>
            ))}
          </div>
        </div>

        {/* Job cards list */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filtered.map(job => (
            <div
              key={job.id}
              onClick={() => setSelected(job)}
              className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                selected?.id === job.id ? 'bg-blue-50 border-l-2 border-blue-600' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center font-semibold text-gray-700 text-sm flex-shrink-0">
                    {job.company[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{job.role}</p>
                    <p className="text-xs text-gray-500">{job.company}</p>
                  </div>
                </div>
                <button onClick={(e) => toggleSave(job.id, e)}>
                  <Bookmark
                    size={16}
                    className={saved.includes(job.id) ? 'text-blue-600 fill-blue-600' : 'text-gray-300 hover:text-gray-500'}
                  />
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${fitColor(job.fit)}`}>
                  {job.fit}% · {fitLabel(job.fit)}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={10} /> {job.deadline}
                </span>
                <span className="text-xs text-gray-400">{job.ctc}</span>
              </div>
              {applied.includes(job.id) && (
                <p className="text-xs text-green-600 font-medium mt-1.5">✓ Applied</p>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">No jobs found</div>
          )}
        </div>
      </div>

      {/* Right panel — job detail */}
      {selected && (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div className="max-w-2xl">

            {/* Header */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center font-bold text-gray-700 text-xl">
                    {selected.company[0]}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selected.role}</h2>
                    <p className="text-gray-500 text-sm">{selected.company}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${fitColor(selected.fit)}`}>
                  {selected.fit}% fit
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
                  <Clock size={14} className="text-gray-400" /> Deadline in {selected.deadline}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleApply(selected.id)}
                  disabled={applied.includes(selected.id)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                    applied.includes(selected.id)
                      ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {applied.includes(selected.id) ? '✓ Applied successfully' : 'Apply now'}
                </button>
                <button
                  onClick={(e) => toggleSave(selected.id, e)}
                  className="px-4 py-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <Bookmark
                    size={18}
                    className={saved.includes(selected.id) ? 'text-blue-600 fill-blue-600' : 'text-gray-400'}
                  />
                </button>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">About this role</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{selected.description}</p>
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
              <h3 className="font-semibold text-gray-900 mb-4">Job details</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Min. CGPA', value: `${selected.cgpa}+` },
                  { label: 'Job type', value: selected.type },
                  { label: 'Applicants', value: selected.applicants },
                  { label: 'Posted', value: selected.posted },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className="text-sm font-medium text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills required */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Skills required</h3>
              <div className="flex flex-wrap gap-2">
                {selected.skills.map(skill => (
                  <span key={skill} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}