import { useEffect, useState } from 'react'
import { placementApi } from '../../services/api'
import {
  Briefcase, MapPin, Calendar, Building2, Loader2, CheckCircle2, Clock3, Sparkles
} from 'lucide-react'

export default function Drives() {
  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [applyingId, setApplyingId] = useState(null)
  const [appliedIds, setAppliedIds] = useState(new Set())

  const fetchDrives = async () => {
    setLoading(true)
    setError(null)
    try {
      const [drivesRes, appsRes] = await Promise.all([
        placementApi.getDrives(),
        placementApi.getMyApplications().catch(() => ({ data: { data: [] } }))
      ])
      const list = drivesRes?.data?.data ?? drivesRes?.data ?? []
      setDrives(Array.isArray(list) ? list : [])
      const apps = appsRes?.data?.data ?? []
      setAppliedIds(new Set(apps.map(a => a.jobId || a.driveId || a.id)))
    } catch (err) {
      setError('Could not load drives. Please try again.')
      setDrives([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDrives() }, [])

  const applyToDrive = async (driveId) => {
    setApplyingId(driveId)
    setError(null)
    try {
      await placementApi.applyToJob(driveId, {})
      setAppliedIds(prev => new Set([...prev, driveId]))
    } catch (err) {
      const msg = err?.response?.data?.message || ''
      if (msg.toLowerCase().includes('already applied')) {
        setAppliedIds(prev => new Set([...prev, driveId]))
      } else {
        setError(msg || 'Could not apply. Please try again.')
      }
    } finally {
      setApplyingId(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_left,#fff,transparent_45%)]" />
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="p-2 rounded-xl bg-white/10 backdrop-blur">
            <Sparkles size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium uppercase tracking-wide text-white/80">Placement drives</p>
            <h1 className="text-2xl font-semibold leading-tight">Apply to the latest drives curated by your TPO</h1>
            <p className="text-sm text-white/80 mt-1">Track status, deadlines, and apply in one click.</p>
          </div>
          <button
            onClick={fetchDrives}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-blue-700 font-semibold shadow-md hover:shadow-lg transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="animate-spin" size={18} />
          <span>Loading drives...</span>
        </div>
      ) : drives.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-gray-500">
          No drives available right now.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {drives.map((drive) => {
            const id = drive.id || drive._id
            const isApplied = appliedIds.has(id)
            const status = (drive.status || 'Open').toUpperCase()
            return (
              <div key={id} className="relative overflow-hidden glass-card lift">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                      <Briefcase size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {drive.title || drive.role || 'Drive'}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {drive.company || drive.companyName || 'Company'}
                          </p>
                        </div>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                          {status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    {drive.location && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100">
                        <MapPin size={14} /> {drive.location}
                      </span>
                    )}
                    {drive.driveDate && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100">
                        <Calendar size={14} /> {new Date(drive.driveDate).toLocaleDateString()}
                      </span>
                    )}
                    {drive.ctc && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100">
                        <Building2 size={14} /> {drive.ctc}
                      </span>
                    )}
                    {drive.deadline && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 text-orange-700">
                        <Clock3 size={14} /> Apply by {new Date(drive.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-700 line-clamp-3">
                    {drive.description || drive.about || 'Drive details will appear here.'}
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => applyToDrive(id)}
                      disabled={applyingId === id || isApplied}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        isApplied
                          ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                      }`}
                    >
                      {isApplied ? (
                        <span className="inline-flex items-center gap-1"><CheckCircle2 size={16} /> Applied</span>
                      ) : applyingId === id ? 'Applying…' : 'Apply'}
                    </button>
                    {drive.slots && (
                      <span className="text-xs text-gray-500">Slots left: {drive.slots}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
