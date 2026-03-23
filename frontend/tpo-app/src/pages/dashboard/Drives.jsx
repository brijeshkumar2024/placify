import { useState } from 'react'
import { Plus, Building2, Clock, Users, ChevronRight, X, CheckCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'

const initialDrives = [
  { id: 1, company: 'Google', role: 'Software Engineer', ctc: '45 LPA', status: 'active', students: 128, deadline: '30 Apr 2026', rounds: ['Aptitude', 'Technical', 'HR'] },
  { id: 2, company: 'Microsoft', role: 'SDE-1', ctc: '40 LPA', status: 'active', students: 94, deadline: '25 Apr 2026', rounds: ['Coding', 'Technical', 'HR'] },
  { id: 3, company: 'Infosys', role: 'Systems Engineer', ctc: '8 LPA', status: 'completed', students: 520, deadline: '15 Mar 2026', rounds: ['Aptitude', 'HR'] },
]

export default function Drives() {
  const [drives, setDrives] = useState(initialDrives)
  const [showModal, setShowModal] = useState(false)
  const [saved, setSaved] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const onSubmit = (data) => {
    const newDrive = {
      id: drives.length + 1,
      company: data.company,
      role: data.role,
      ctc: data.ctc,
      status: 'active',
      students: 0,
      deadline: data.deadline,
      rounds: data.rounds.split(',').map(r => r.trim()),
    }
    setDrives(prev => [newDrive, ...prev])
    setSaved(true)
    setTimeout(() => { setSaved(false); setShowModal(false); reset() }, 1500)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Placement drives</h2>
          <p className="text-gray-500 text-sm mt-1">{drives.filter(d => d.status === 'active').length} active drives</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all">
          <Plus size={16} /> Create drive
        </button>
      </div>

      <div className="space-y-4">
        {drives.map(drive => (
          <div key={drive.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-sm transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center font-bold text-blue-700 text-lg">
                  {drive.company[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{drive.company}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      drive.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>{drive.status}</span>
                  </div>
                  <p className="text-sm text-gray-500">{drive.role} · {drive.ctc}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </div>
            <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-gray-400" /> {drive.students} registered
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-gray-400" /> {drive.deadline}
              </span>
            </div>
            <div className="flex gap-2 mt-3">
              {drive.rounds.map((r, i) => (
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