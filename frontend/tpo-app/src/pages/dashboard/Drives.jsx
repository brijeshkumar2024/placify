import { useEffect, useState } from 'react'
import { Plus, Clock, Users, ChevronRight, X, CheckCircle, AlertTriangle, ArrowLeft, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { placementApi } from '../../services/api'

const statusColor = (s) =>
  (s || '').toLowerCase() === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'

const appStatusColor = (s) => {
  const m = { APPLIED: 'bg-blue-50 text-blue-700', SHORTLISTED: 'bg-amber-50 text-amber-700',
    INTERVIEW: 'bg-purple-50 text-purple-700', OFFER: 'bg-green-50 text-green-700',
    REJECTED: 'bg-red-50 text-red-600' }
  return m[s] || 'bg-gray-100 text-gray-600'
}

export default function Drives() {
  const [drives, setDrives] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)       // selected drive
  const [applicants, setApplicants] = useState([])
  const [appsLoading, setAppsLoading] = useState(false)
  const [revoking, setRevoking] = useState(null)
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    placementApi.getDrives()
      .then(res => setDrives(res.data?.data || []))
      .catch(() => setError('Could not load drives'))
      .finally(() => setLoading(false))
  }, [])

  const openDrive = (drive) => {
    setSelected(drive)
    setApplicants([])
    setAppsLoading(true)
    placementApi.getDriveApplicants(drive.id)
      .then(res => setApplicants(res.data?.data || []))
      .catch(() => setApplicants([]))
      .finally(() => setAppsLoading(false))
  }

  const handleRevoke = (appId) => {
    setRevoking(appId)
    placementApi.revokeApplication(appId)
      .then(() => setApplicants(prev => prev.filter(a => a.id !== appId)))
      .catch(() => {})
      .finally(() => setRevoking(null))
  }

  const onSubmit = (data) => {
    const payload = {
      company: data.company,
      jobId: data.jobId || '',
      tpoId: 'tpo',
      collegeId: 'college',
      minCgpa: data.minCgpa ? Number(data.minCgpa) : null,
      branches: data.branches ? data.branches.split(',').map(b => b.trim()) : [],
      graduationYear: data.graduationYear ? Number(data.graduationYear) : null,
      maxBacklogs: data.maxBacklogs ? Number(data.maxBacklogs) : null,
      rounds: data.rounds ? data.rounds.split(',').map(r => r.trim()) : [],
      deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
    }
    placementApi.createDrive(payload)
      .then(res => {
        setDrives(prev => [res.data.data, ...prev])
        setSaved(true)
        setTimeout(() => { setSaved(false); setShowModal(false); reset() }, 1200)
      })
      .catch(() => setError('Could not create drive'))
  }

  // ── DETAIL PANEL ──────────────────────────────────────────────────────────
  if (selected) return (
    <div className="p-8">
      <button onClick={() => setSelected(null)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to drives
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center font-bold text-blue-700 text-lg">
            {selected.company?.[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-900">{selected.company}</h2>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor(selected.status)}`}>
                {selected.status}
              </span>
            </div>
            <p className="text-sm text-gray-500">{selected.role || selected.jobId} · {selected.ctc || ''}</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Users size={14} /> {applicants.length} applicants
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} /> {selected.deadline ? new Date(selected.deadline).toLocaleDateString() : '—'}
            </span>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          {(selected.rounds || []).map((r, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
              <span className="w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
              {r}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Applied students <span className="text-gray-400 font-normal text-sm">({applicants.length})</span>
        </h3>

        {appsLoading ? (
          <p className="text-sm text-gray-400">Loading applicants…</p>
        ) : applicants.length === 0 ? (
          <div className="text-center py-10">
            <Users size={32} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No students have applied yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applicants.map(a => (
              <div key={a.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-700">
                    {(a.studentName || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{a.studentName || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{a.studentEmail || '—'} · CGPA {a.studentCgpa ?? '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${appStatusColor(a.status)}`}>
                    {a.status}
                  </span>
                  <button
                    onClick={() => handleRevoke(a.id)}
                    disabled={revoking === a.id}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50"
                  >
                    <Trash2 size={13} /> {revoking === a.id ? 'Revoking…' : 'Revoke'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // ── DRIVES LIST ───────────────────────────────────────────────────────────
  return (
    <div className="p-8">
      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Placement drives</h2>
          <p className="text-gray-500 text-sm mt-1">{drives.filter(d => (d.status || '').toLowerCase() === 'active').length} active · {drives.length} total drives</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all">
          <Plus size={16} /> Create drive
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-gray-400">Loading drives…</p>
        ) : drives.length === 0 ? (
          <p className="text-sm text-gray-400">No drives found</p>
        ) : drives.map(drive => (
          <div key={drive.id}
            onClick={() => openDrive(drive)}
            className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center font-bold text-blue-700 text-lg">
                  {drive.company[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{drive.company}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor(drive.status)}`}>
                      {drive.status || 'N/A'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{drive.role || drive.jobId} · {drive.ctc || ''}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-gray-400" /> {(drive.registeredStudents || []).length} registered
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-gray-400" /> {drive.deadline ? new Date(drive.deadline).toLocaleDateString() : '—'}
              </span>
            </div>
            <div className="flex gap-2 mt-3">
              {(drive.rounds || []).map((r, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                  <span className="w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  {r}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 w-full max-w-md shadow-xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900">Create placement drive</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            {saved ? (
              <div className="text-center py-6">
                <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                <p className="font-medium text-gray-900">Drive created successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {[
                  { name: 'company', label: 'Company name', placeholder: 'Google' },
                  { name: 'role', label: 'Job role', placeholder: 'Software Engineer' },
                  { name: 'ctc', label: 'CTC offered', placeholder: '12 LPA' },
                  { name: 'rounds', label: 'Rounds (comma separated)', placeholder: 'Aptitude, Technical, HR' },
                ].map(({ name, label, placeholder }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                    <input placeholder={placeholder}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register(name, { required: true })} />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Deadline</label>
                  <input type="date"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('deadline', { required: true })} />
                </div>
                <button type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all">
                  Create drive
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
