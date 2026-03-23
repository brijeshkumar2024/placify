import { useState } from 'react'
import { Search, Filter, TrendingUp, AlertTriangle } from 'lucide-react'

const students = [
  { id: 1, name: 'Brijesh Mohanty', roll: 'CS2021001', branch: 'CSE', cgpa: 8.5, skills: ['Java', 'DSA', 'SQL'], status: 'placed', company: 'Google', readiness: 92 },
  { id: 2, name: 'Rahul Sharma', roll: 'CS2021045', branch: 'CSE', cgpa: 7.2, skills: ['Python', 'ML'], status: 'in-process', company: null, readiness: 65 },
  { id: 3, name: 'Priya Patel', roll: 'CS2021089', branch: 'IT', cgpa: 8.1, skills: ['React', 'Node.js'], status: 'in-process', company: null, readiness: 78 },
  { id: 4, name: 'Amit Kumar', roll: 'CS2021023', branch: 'CSE', cgpa: 6.8, skills: ['Java', 'SQL'], status: 'at-risk', company: null, readiness: 42 },
  { id: 5, name: 'Sneha Rao', roll: 'CS2021067', branch: 'ECE', cgpa: 7.9, skills: ['C++', 'DSA'], status: 'in-process', company: null, readiness: 71 },
  { id: 6, name: 'Vikram Singh', roll: 'CS2021034', branch: 'CSE', cgpa: 9.1, skills: ['Java', 'System Design', 'DSA'], status: 'placed', company: 'Microsoft', readiness: 95 },
]

const statusConfig = {
  placed: { label: 'Placed', color: 'bg-green-50 text-green-700' },
  'in-process': { label: 'In process', color: 'bg-blue-50 text-blue-700' },
  'at-risk': { label: 'At risk', color: 'bg-red-50 text-red-600' },
}

export default function Students() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.roll.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || s.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Students</h2>
        <p className="text-gray-500 text-sm mt-1">{students.length} total · {students.filter(s => s.status === 'placed').length} placed · {students.filter(s => s.status === 'at-risk').length} at risk</p>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name or roll number..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <div className="flex gap-2">
          {['all', 'placed', 'in-process', 'at-risk'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {f === 'all' ? 'All' : f === 'in-process' ? 'In process' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['Student', 'Roll no', 'Branch', 'CGPA', 'Skills', 'Readiness', 'Status'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-gray-50 transition-all">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-700">
                      {s.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.name}</p>
                      {s.company && <p className="text-xs text-green-600">{s.company}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">{s.roll}</td>
                <td className="px-5 py-4 text-sm text-gray-600">{s.branch}</td>
                <td className="px-5 py-4 text-sm font-medium text-gray-900">{s.cgpa}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-1 flex-wrap">
                    {s.skills.slice(0, 2).map(skill => (
                      <span key={skill} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{skill}</span>
                    ))}
                    {s.skills.length > 2 && <span className="text-xs text-gray-400">+{s.skills.length - 2}</span>}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${s.readiness >= 75 ? 'bg-green-500' : s.readiness >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ width: `${s.readiness}%` }} />
                    </div>
                    <span className="text-xs font-medium text-gray-700">{s.readiness}%</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusConfig[s.status].color}`}>
                    {statusConfig[s.status].label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">No students found</p>
          </div>
        )}
      </div>
    </div>
  )
}