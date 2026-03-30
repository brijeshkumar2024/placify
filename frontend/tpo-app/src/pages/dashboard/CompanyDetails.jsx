import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Briefcase, Users, DollarSign, AlertTriangle } from 'lucide-react'
import { jobApi } from '../../services/api'

const statusColors = {
  APPLIED:     'bg-blue-100 text-blue-700',
  SHORTLISTED: 'bg-yellow-100 text-yellow-700',
  INTERVIEW:   'bg-purple-100 text-purple-700',
  OFFER:       'bg-green-100 text-green-700',
  HIRED:       'bg-green-100 text-green-700',
  REJECTED:    'bg-red-100 text-red-700',
}

export default function CompanyDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    jobApi.getCompanyDetails(id)
      .then(res => setCompany(res.data?.data))
      .catch(err => {
        const msg = err.response?.data?.message || err.message || 'Could not load company details'
        setError(`Could not load company details — ${msg} (${err.response?.status ?? 'network error'})`)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-8 text-sm text-gray-400">Loading…</div>

  if (error) return (
    <div className="p-8">
      <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2">
        <AlertTriangle size={16} /> {error}
      </div>
    </div>
  )

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Companies
      </button>

      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 flex items-center gap-5">
        <div className="w-16 h-16 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center text-2xl font-bold">
          {company.companyName?.[0] ?? '?'}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{company.companyName}</h1>
          {company.location && (
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <MapPin size={13} /> {company.location}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { icon: <Briefcase size={18} />, label: 'Openings',   value: company.openings },
          { icon: <Users size={18} />,     label: 'Applicants', value: company.applicants },
          { icon: <DollarSign size={18} />, label: 'CTC',       value: company.ctc || '—' },
          { icon: <Briefcase size={18} />, label: 'Roles',      value: company.roles?.length ?? 0 },
        ].map(({ icon, label, value }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-1">
            <div className="text-gray-400">{icon}</div>
            <p className="text-xl font-semibold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Roles */}
      {company.roles?.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Open Roles</h2>
          <div className="flex flex-wrap gap-2">
            {company.roles.map(role => (
              <span key={role} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{role}</span>
            ))}
          </div>
        </div>
      )}

      {/* Applicants */}
      {company.applicantList?.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-700">Applicants</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Name', 'Email', 'Role', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {company.applicantList.map((a, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-gray-900">{a.studentName || '—'}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{a.studentEmail || '—'}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{a.role || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[a.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {a.status ?? '—'}
                    </span>
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
