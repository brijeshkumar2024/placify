import { useEffect, useRef, useState } from 'react'
import { Search, AlertTriangle, Plus, Upload, FileSpreadsheet, Trash2 } from 'lucide-react'
import { placementApi } from '../../services/api'

const statusConfig = {
  placed: { label: 'Placed', color: 'bg-green-50 text-green-700' },
  'in-process': { label: 'In process', color: 'bg-blue-50 text-blue-700' },
  'at-risk': { label: 'At risk', color: 'bg-red-50 text-red-600' },
  hold: { label: 'On hold', color: 'bg-amber-50 text-amber-700' },
}

const initialForm = {
  fullName: '',
  email: '',
  rollNumber: '',
  branch: '',
  cgpa: '',
  graduationYear: '',
  phone: '',
  skills: '',
}

export default function Students() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [editingReadiness, setEditingReadiness] = useState(null) // { id, value }
  const fileInput = useRef(null)

  useEffect(() => { refreshStudents() }, [])

  const refreshStudents = () => {
    setLoading(true)
    placementApi.getStudents()
      .then(res => {
        const data = res.data?.data || []
        const mapped = data.map((s, idx) => ({
          id: s.id || idx,
          name: s.fullName || 'Unknown student',
          roll: s.rollNumber || '—',
          branch: s.branch || '—',
          cgpa: s.cgpa ?? '—',
          skills: s.skills || [],
          status: s.status || 'in-process',
          company: s.placedCompany,
          readiness: s.readiness ?? 40,
          phone: s.phone,
          email: s.email,
          graduationYear: s.graduationYear,
          source: s.source || 'manual',
        }))
        setStudents(mapped)
        setError(null)
      })
      .catch(() => setError('Could not load students'))
      .finally(() => setLoading(false))
  }

  const handleAddStudent = () => {
    setSaving(true)
    const payload = {
      ...form,
      cgpa: form.cgpa ? Number(form.cgpa) : 0,
      graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined,
      skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
    }
    placementApi.createStudent(payload)
      .then(() => {
        setShowModal(false)
        setForm(initialForm)
        refreshStudents()
      })
      .catch(() => setError('Could not add student'))
      .finally(() => setSaving(false))
  }

  const handleImport = (file) => {
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    setImporting(true)
    placementApi.importStudents(formData)
      .then(() => refreshStudents())
      .catch(() => setError('Import failed. Please use the template order.'))
      .finally(() => {
        setImporting(false)
        if (fileInput.current) fileInput.current.value = ''
      })
  }

  const handleUpdateReadiness = (id, value) => {
    const clamped = Math.min(100, Math.max(0, Number(value)))
    placementApi.updateStudent(id, { readiness: clamped })
      .then(() => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, readiness: clamped } : s))
        setEditingReadiness(null)
      })
      .catch(() => setEditingReadiness(null))
  }

  const handleUpdateStatus = (id, status) => {
    placementApi.updateStudent(id, { status })
      .then(() => setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s)))
      .catch(() => {})
  }

  const handleDelete = (id) => {
    if (!confirm('Remove this student? This action cannot be undone.')) return
    placementApi.deleteStudent(id)
      .then(() => setStudents(prev => prev.filter(s => s.id !== id)))
      .catch(() => setError('Could not remove student'))
  }

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.roll.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || s.status === filter
    return matchSearch && matchFilter
  })

  if (loading) {
    return <div className="p-8 text-sm text-gray-500">Loading students…</div>
  }

  if (error) {
    return (
      <div className="p-8 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">
        <AlertTriangle size={16} /> {error}
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Students</h2>
          <p className="text-gray-500 text-sm mt-1">
            {students.length} total · {students.filter(s => s.status === 'placed').length} placed · {students.filter(s => s.status === 'at-risk').length} at risk
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> Add student
          </button>
          <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl border border-gray-200 text-sm font-medium shadow-sm hover:bg-gray-50 cursor-pointer">
            <Upload size={16} /> {importing ? 'Importing…' : 'Import Excel'}
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              ref={fileInput}
              onChange={e => handleImport(e.target.files?.[0])}
              disabled={importing}
            />
          </label>
        </div>
      </div>

      <div className="flex gap-3 mb-6 items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name or roll number..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <div className="flex gap-2">
          {['all', 'placed', 'in-process', 'at-risk', 'hold'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {f === 'all' ? 'All' : f === 'in-process' ? 'In process' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="table-premium">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['Student', 'Roll no', 'Branch', 'CGPA', 'Skills', 'Readiness', 'Status', 'Source', ''].map(h => (
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
                      {s.email && <p className="text-xs text-gray-500">{s.email}</p>}
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
                    {editingReadiness?.id === s.id ? (
                      <input
                        type="number" min="0" max="100"
                        className="w-14 text-xs border border-blue-300 rounded px-1 py-0.5 focus:outline-none"
                        value={editingReadiness.value}
                        onChange={e => setEditingReadiness({ id: s.id, value: e.target.value })}
                        onBlur={e => handleUpdateReadiness(s.id, e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleUpdateReadiness(s.id, editingReadiness.value)}
                        autoFocus
                      />
                    ) : (
                      <span
                        className="text-xs font-medium text-gray-700 cursor-pointer hover:text-blue-600 hover:underline"
                        title="Click to edit"
                        onClick={() => setEditingReadiness({ id: s.id, value: s.readiness })}
                      >
                        {s.readiness}%
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <select
                    value={s.status}
                    onChange={e => handleUpdateStatus(s.id, e.target.value)}
                    className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-300 ${statusConfig[s.status]?.color || statusConfig['in-process'].color}`}
                  >
                    <option value="in-process">In process</option>
                    <option value="placed">Placed</option>
                    <option value="at-risk">At risk</option>
                    <option value="hold">On hold</option>
                  </select>
                </td>
                <td className="px-5 py-4 text-xs text-gray-500">{s.source}</td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-semibold"
                    title="Remove student"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
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

      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Add new student</h3>
                <p className="text-xs text-gray-500">Capture the essentials so you can track them right away.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700 text-sm">Close</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Full name</label>
                <input className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500">Email</label>
                <input className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500">Roll number</label>
                <input className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.rollNumber} onChange={e => setForm({ ...form, rollNumber: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500">Branch</label>
                <input className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500">CGPA</label>
                <input type="number" step="0.01" className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.cgpa} onChange={e => setForm({ ...form, cgpa: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500">Graduation year</label>
                <input type="number" className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.graduationYear} onChange={e => setForm({ ...form, graduationYear: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500">Phone</label>
                <input className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500">Skills (comma separated)</label>
                <input className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="Java, React, SQL" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-5 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={14} className="text-emerald-500" />
                Excel import expects: Name, Email, Roll, Branch, CGPA, GradYear, Phone, Skills
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700">Cancel</button>
                <button disabled={saving} onClick={handleAddStudent} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
                  {saving ? 'Saving…' : 'Save student'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
