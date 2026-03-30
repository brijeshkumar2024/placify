import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, FileText, Star, Calendar, LinkIcon, X, Check, Clock } from 'lucide-react'
import { jobApi } from '../../services/api'

// ── Controlled Star Rating ─────────────────────────────────────────────────────
// Fully controlled: value comes from parent, no internal state for the rating.
// Only UI-transient state (hover, saving spinner) lives here.
function StarRating({ applicationId, value, onRatingChange }) {
  const [hovered, setHovered] = useState(0)
  const [saving, setSaving] = useState(false)

  const handleClick = async (star) => {
    if (saving) return
    console.log('[StarRating] Sending rating:', star, '| applicationId:', applicationId)
    setSaving(true)
    try {
      const res = await jobApi.updateRating(applicationId, star)
      const saved = res.data?.data
      console.log('[StarRating] Response:', saved)
      // Push the confirmed value from the server up to parent
      onRatingChange(applicationId, saved?.rating ?? star)
    } catch (err) {
      console.error('[StarRating] Failed:', err.response?.data ?? err.message)
    } finally {
      setSaving(false)
    }
  }

  const displayed = hovered || value || 0

  return (
    <div className="flex items-center gap-0.5" title="Click to rate">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          disabled={saving}
          onClick={() => handleClick(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-125 disabled:opacity-40 focus:outline-none"
        >
          <Star
            size={15}
            className={
              star <= displayed
                ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                : 'text-gray-300'
            }
          />
        </button>
      ))}
      {saving && (
        <span className="ml-1 w-3 h-3 border border-amber-400 border-t-transparent rounded-full animate-spin inline-block" />
      )}
    </div>
  )
}

// ── Controlled Notes Input ─────────────────────────────────────────────────────
// The textarea is controlled by local draft state for smooth typing.
// On blur it calls the API and pushes the confirmed value to parent.
// Parent value is used ONLY to initialise the draft on mount — never again,
// because the parent state is updated from the API response, not from this component.
function NotesInput({ applicationId, value: parentValue, onNotesChange }) {
  // draft: what the user is currently typing — local only
  const [draft, setDraft] = useState(parentValue ?? '')
  const [status, setStatus] = useState(null) // 'saving' | 'saved' | 'error'
  const timerRef = useRef(null)
  // Track the last value that was successfully persisted to avoid duplicate saves
  const persistedRef = useRef(parentValue ?? '')

  // Only sync draft from parent when the applicationId changes (card swap),
  // NOT on every parent re-render — this is the key fix.
  useEffect(() => {
    setDraft(parentValue ?? '')
    persistedRef.current = parentValue ?? ''
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const save = async (text) => {
    if (text === persistedRef.current) return // nothing new to save
    console.log('[NotesInput] Sending notes | applicationId:', applicationId, '| length:', text.length)
    setStatus('saving')
    clearTimeout(timerRef.current)
    try {
      const res = await jobApi.updateNotes(applicationId, text)
      const saved = res.data?.data
      console.log('[NotesInput] Response:', saved)
      persistedRef.current = saved?.notes ?? text
      setDraft(saved?.notes ?? text)
      setStatus('saved')
      onNotesChange(applicationId, saved?.notes ?? text)
    } catch (err) {
      console.error('[NotesInput] Failed:', err.response?.data ?? err.message)
      setStatus('error')
    } finally {
      timerRef.current = setTimeout(() => setStatus(null), 2500)
    }
  }

  return (
    <div className="mt-2">
      <div className="relative">
        <textarea
          rows={2}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={() => save(draft)}
          placeholder="Add recruiter notes…"
          className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white placeholder:text-gray-400 transition-all"
        />
        <div className="absolute bottom-2 right-2 pointer-events-none">
          {status === 'saving' && (
            <span className="text-[10px] text-gray-400 italic">saving…</span>
          )}
          {status === 'saved' && (
            <span className="flex items-center gap-0.5 text-[10px] text-green-600 font-medium">
              <Check size={10} /> Saved
            </span>
          )}
          {status === 'error' && (
            <span className="text-[10px] text-red-400">failed</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Schedule Modal ─────────────────────────────────────────────────────────────
function ScheduleModal({ applicant, job, onClose, onScheduled }) {
  const [date, setDate]       = useState('')
  const [time, setTime]       = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [success, setSuccess] = useState(false)

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!date || !time) return

    const studentEmail = applicant.email || applicant.studentEmail || ''
    const dateTime = `${date}T${time.length === 5 ? `${time}:00` : time}`
    const payload = {
      applicationId: applicant.id,
      studentEmail,
      dateTime,
      message,
    }

    console.log('[ScheduleInterview] Request payload:', payload)

    if (!payload.applicationId || !payload.studentEmail || !payload.dateTime) {
      setError('Missing fields: applicationId, studentEmail, and dateTime are required.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await jobApi.scheduleInterview(payload)
      console.log('[ScheduleInterview] Response body:', res.data)

      const scheduledValue = res.data?.data?.scheduledAt || dateTime
      setSuccess(true)
      onScheduled(applicant.id, scheduledValue)
      setTimeout(onClose, 1800)
    } catch (err) {
      console.error('[ScheduleInterview] Failed response:', err.response?.data ?? err.message)
      setError(err.response?.data?.message ?? 'Failed to schedule interview. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const initials = (applicant.name || 'C').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const today    = new Date().toISOString().split('T')[0]

  return (
    // ── Backdrop ──
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* ── Card ── */}
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-200/80 overflow-hidden"
        style={{ animation: 'modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

        <div className="p-7">

          {/* ── Header ── */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md shrink-0">
                {initials}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 leading-tight">Schedule Interview</h3>
                <p className="text-sm text-gray-500 mt-0.5 truncate max-w-[220px]">
                  {applicant.name}
                  {applicant.email && <span className="text-gray-400"> · {applicant.email}</span>}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all active:scale-95 shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── Success state ── */}
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                <Check size={26} className="text-emerald-500" strokeWidth={2.5} />
              </div>
              <p className="text-base font-semibold text-gray-900">Interview Scheduled!</p>
              <p className="text-sm text-gray-500 text-center">
                Interview saved for <span className="font-medium text-gray-700">{applicant.email || 'the candidate'}</span>.
                Notification delivery is logged server-side.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* ── Date + Time row ── */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block">
                    Date
                  </label>
                  <div className="relative">
                    <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="date"
                      required
                      min={today}
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block">
                    Time
                  </label>
                  <div className="relative">
                    <Clock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* ── Role badge (read-only context) ── */}
              {(job?.title || applicant.role) && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-xs text-blue-700 font-medium">
                    {job?.company && <span className="text-blue-500">{job.company} · </span>}
                    {job?.title ?? applicant.role}
                  </span>
                </div>
              )}

              {/* ── Message ── */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block">
                  Message <span className="normal-case font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Add meeting link, instructions, or any notes for the candidate…"
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white placeholder:text-gray-400 transition-all leading-relaxed"
                />
              </div>

              {/* ── Error ── */}
              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <X size={15} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 leading-snug">{error}</p>
                </div>
              )}

              {/* ── Actions ── */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 text-sm font-medium border border-gray-200 text-gray-600 rounded-xl py-2.5 hover:bg-gray-100 hover:border-gray-300 active:scale-[0.98] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !date || !time}
                  className="flex-1 text-sm font-semibold text-white rounded-xl py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg hover:shadow-blue-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Calendar size={14} /> Schedule &amp; Send Email</>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>

      {/* ── Keyframe injected inline (no framer-motion dependency) ── */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  )
}

// ── Status badge colours ───────────────────────────────────────────────────────
const STATUS_STYLES = {
  APPLIED:     'bg-gray-100 text-gray-600',
  SHORTLISTED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  INTERVIEW:   'bg-blue-50 text-blue-700 border border-blue-200',
  REJECTED:    'bg-red-50 text-red-600 border border-red-200',
  HIRED:       'bg-purple-50 text-purple-700 border border-purple-200',
  OFFER:       'bg-amber-50 text-amber-700 border border-amber-200',
}

// ── Applicant Card ─────────────────────────────────────────────────────────────
// Receives the full applicant object from parent — rating and notes come from
// applicant.rating and applicant.notes, never from internal state.
function ApplicantCard({ applicant, job, onStatusChange, onRatingChange, onNotesChange, onScheduleClick, onQuickInterview, updating }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">

      {/* ── Header: avatar + name + date ── */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
          {(applicant.name || 'C')[0].toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
              {applicant.name || 'Candidate'}
            </p>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLES[applicant.status] ?? STATUS_STYLES.APPLIED}`}>
              {applicant.status}
            </span>
          </div>
          <p className="text-xs text-gray-500 truncate mt-0.5">{applicant.email || '—'}</p>
        </div>
      </div>

      {/* ── Skill + CGPA badges ── */}
      <div className="flex flex-wrap gap-1 mb-3">
        {applicant.skills?.slice(0, 3).map(s => (
          <span key={s} className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{s}</span>
        ))}
        {applicant.cgpa && (
          <span className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full">CGPA {applicant.cgpa}</span>
        )}
        {applicant.matchScore && (
          <span className="text-[11px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">Match {applicant.matchScore}%</span>
        )}
      </div>

      {/* ── Resume link ── */}
      {applicant.resumeUrl && (
        <a href={applicant.resumeUrl} target="_blank" rel="noreferrer"
          className="flex items-center gap-1 text-xs text-blue-600 hover:underline mb-3">
          <FileText size={12} /> Resume
        </a>
      )}

      {/* ── Pipeline status buttons ── */}
      <div className="flex items-center gap-1 flex-wrap mb-3">
        {['SHORTLISTED', 'INTERVIEW', 'REJECTED', 'HIRED'].map(next => (
          <button key={next}
            onClick={() => onStatusChange(applicant.id, next)}
            disabled={updating === applicant.id || applicant.status === next}
            className={`text-[11px] px-2 py-1 rounded-lg border transition-all ${
              applicant.status === next
                ? 'border-green-200 text-green-700 bg-green-50 font-medium'
                : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50'
            } disabled:opacity-40`}>
            {next}
          </button>
        ))}
      </div>

      {/* ── Star Rating (fully controlled from parent) ── */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] text-gray-500 w-10 shrink-0">Rating</span>
        <StarRating
          applicationId={applicant.id}
          value={applicant.rating}        // ← truth comes from parent state
          onRatingChange={onRatingChange} // ← pushes confirmed value back up
        />
        <span className="text-[11px] text-amber-600 font-medium ml-1">
          {applicant.rating ? `${applicant.rating}/5` : <span className="text-gray-400 font-normal">Not rated</span>}
        </span>
      </div>

      {/* ── Scheduled interview badge ── */}
      {applicant.interviewDateTime && (
        <div className="flex items-center gap-1.5 mb-2 text-[11px] text-purple-700 bg-purple-50 border border-purple-100 rounded-lg px-2 py-1.5">
          <Clock size={11} />
          Interview: {new Date(applicant.interviewDateTime).toLocaleString()}
        </div>
      )}

      {/* ── Notes (controlled draft, parent owns persisted value) ── */}
      <NotesInput
        applicationId={applicant.id}
        value={applicant.notes}          // ← truth comes from parent state
        onNotesChange={onNotesChange}    // ← pushes confirmed value back up
      />

      {/* ── Action buttons ── */}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => onScheduleClick(applicant)}
          className="flex-1 text-[11px] text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 px-2 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all shadow-sm">
          <Calendar size={11} /> Schedule
        </button>
        <button
          onClick={() => onQuickInterview(applicant.id)}
          className="flex-1 text-[11px] text-white bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 px-2 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all shadow-sm">
          <LinkIcon size={11} /> Quick Interview
        </button>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Applicants() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applicants, setApplicants] = useState([])
  const [updating, setUpdating] = useState(null)
  const [filter, setFilter] = useState('ALL')
  const [counts, setCounts] = useState({})
  const [scheduleTarget, setScheduleTarget] = useState(null)

  useEffect(() => {
    Promise.all([
      jobApi.getJob(jobId),
      jobApi.getApplicantsByJob(jobId),
      jobApi.getApplicantCounts(jobId),
    ])
      .then(([jobRes, appRes, countRes]) => {
        setJob(jobRes.data.data)
        setApplicants(appRes.data.data || [])
        setCounts(countRes.data.data || {})
        console.log('[Applicants] Loaded:', appRes.data.data?.length, 'applicants')
      })
      .catch(err => console.error('[Applicants] Load failed:', err.message))
      .finally(() => setLoading(false))
  }, [jobId])

  const pipeline = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'REJECTED', 'HIRED']

  // ── Patch a single applicant field in parent state ──────────────────────────
  // This is the single source of truth update — called by child callbacks after
  // the API confirms the save. Uses functional update to avoid stale closures.
  const patchApplicant = useCallback((applicationId, patch) => {
    setApplicants(prev => {
      const next = prev.map(a => a.id === applicationId ? { ...a, ...patch } : a)
      console.log('[Applicants] State after patch:', next.find(a => a.id === applicationId))
      return next
    })
  }, [])

  // ── Status change ───────────────────────────────────────────────────────────
  const updateStatus = async (applicationId, status) => {
    setUpdating(applicationId)
    try {
      await jobApi.updateApplicationStatus({ applicationId, status })
      patchApplicant(applicationId, { status })
    } catch (err) {
      console.error('[Applicants] Status update failed:', err.message)
    } finally {
      setUpdating(null)
    }
  }

  // ── Rating confirmed by API → patch parent state ────────────────────────────
  const handleRatingChange = useCallback((applicationId, rating) => {
    patchApplicant(applicationId, { rating })
  }, [patchApplicant])

  // ── Notes confirmed by API → patch parent state ─────────────────────────────
  const handleNotesChange = useCallback((applicationId, notes) => {
    patchApplicant(applicationId, { notes })
  }, [patchApplicant])

  // ── Interview scheduled → patch parent state ────────────────────────────────
  const handleScheduled = useCallback((applicationId, scheduledAt) => {
    patchApplicant(applicationId, { interviewDateTime: scheduledAt, status: 'INTERVIEW' })
  }, [patchApplicant])

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[300px]">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-6 max-w-6xl">

      {/* ── Breadcrumb ── */}
      <button onClick={() => navigate('/dashboard/my-jobs')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors group">
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to my jobs
      </button>

      {/* ── Job header ── */}
      {job && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center font-bold text-white text-lg shadow-sm">
            {job.company?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-medium">
                {job.title}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">{job.company} · {job.location} · {job.ctc}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-gray-900">{applicants.length}</p>
            <p className="text-xs text-gray-500">applicants</p>
          </div>
        </div>
      )}

      {/* ── Filter tabs ── */}
      <div className="flex gap-2 flex-wrap mb-5">
        {['ALL', ...pipeline].map(p => {
          const cnt = p === 'ALL' ? applicants.length : (counts?.[p.toLowerCase()] ?? applicants.filter(a => a.status === p).length)
          return (
            <button key={p} onClick={() => setFilter(p)}
              className={`px-3 py-1.5 text-xs rounded-full border font-medium transition-all ${
                filter === p
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700 bg-white'
              }`}>
              {p} <span className="opacity-70">({cnt})</span>
            </button>
          )
        })}
      </div>

      {/* ── Kanban board ── */}
      {applicants.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User size={28} className="text-gray-400" />
          </div>
          <p className="text-gray-700 font-medium">No applicants yet</p>
          <p className="text-gray-400 text-sm mt-1">Candidates will appear here once they apply</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {pipeline.map(stage => {
            const stageApplicants = applicants.filter(a =>
              (filter === 'ALL' || a.status === filter) && a.status === stage
            )
            return (
              <div key={stage} className="shrink-0 w-[260px]">
                {/* Column header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{stage}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                    {counts?.[stage.toLowerCase()] ?? applicants.filter(a => a.status === stage).length}
                  </span>
                </div>
                {/* Cards */}
                <div className="space-y-3">
                  {stageApplicants.map(a => (
                    <ApplicantCard
                      key={a.id}
                      applicant={a}
                      job={job}
                      onStatusChange={updateStatus}
                      onRatingChange={handleRatingChange}
                      onNotesChange={handleNotesChange}
                      onScheduleClick={setScheduleTarget}
                      onQuickInterview={(id) => navigate('/dashboard/interview/start', { state: { candidateId: id, jobId } })}
                      updating={updating}
                    />
                  ))}
                  {stageApplicants.length === 0 && (
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center">
                      <p className="text-xs text-gray-400">No candidates</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Schedule modal ── */}
      {scheduleTarget && (
        <ScheduleModal
          applicant={scheduleTarget}
          job={job}
          onClose={() => setScheduleTarget(null)}
          onScheduled={handleScheduled}
        />
      )}
    </div>
  )
}
