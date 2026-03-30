import { useEffect, useMemo, useState } from 'react'
import { Building2, Briefcase, Users, AlertTriangle } from 'lucide-react'
import { jobApi } from '../../services/api'

export default function Companies() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    jobApi.getAllJobs()
      .then(res => setJobs(res.data?.data || []))
      .catch(() => setError('Could not load companies'))
      .finally(() => setLoading(false))
  }, [])

  const companies = useMemo(() => {
    const bucket = {}
    jobs.forEach(job => {
      const key = job.company || 'Unknown company'
      if (!bucket[key]) {
        bucket[key] = {
          name: key,
          roles: new Set(),
          jobCount: 0,
          applicants: 0,
          ctcSamples: [],
          locations: new Set(),
        }
      }
      bucket[key].jobCount += 1
      bucket[key].roles.add(job.title || job.role || 'Role TBD')
      bucket[key].locations.add(job.location || 'Remote/On-site')
      bucket[key].applicants += job.applicantCount || 0
      if (job.ctc) bucket[key].ctcSamples.push(job.ctc)
    })
    return Object.values(bucket).map(c => ({
      ...c,
      roles: Array.from(c.roles),
      locations: Array.from(c.locations),
      ctcPreview: c.ctcSamples[0] || '—',
    })).sort((a, b) => b.jobCount - a.jobCount)
  }, [jobs])

  return (
    <div className="p-8">
      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Companies</h2>
          <p className="text-gray-500 text-sm mt-1">
            {companies.length} engaged · {jobs.length} open roles
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading companies…</p>
      ) : companies.length === 0 ? (
        <p className="text-sm text-gray-400">No companies found</p>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Company', 'Roles', 'Locations', 'Openings', 'Applicants', 'CTC'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {companies.map((c, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-all">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center font-bold">
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.locations[0]}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">
                    <div className="flex flex-wrap gap-1">
                      {c.roles.slice(0, 3).map(role => (
                        <span key={role} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{role}</span>
                      ))}
                      {c.roles.length > 3 && <span className="text-xs text-gray-400">+{c.roles.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {c.locations.slice(0, 2).join(', ')}{c.locations.length > 2 ? '…' : ''}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Briefcase size={14} className="text-gray-400" /> {c.jobCount}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Users size={14} className="text-gray-400" /> {c.applicants}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">
                    {c.ctcPreview}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
