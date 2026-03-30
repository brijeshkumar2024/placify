import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Clock3, Video } from 'lucide-react'
import { jobApi } from '../../services/api'
import useAuthStore from '../../store/authStore'

export default function Interviews() {
  const { user } = useAuthStore()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.userId) return

    const load = async () => {
      setLoading(true)
      try {
        const jobsRes = await jobApi.getRecruiterJobs(user.userId, null)
        const jobs = jobsRes.data?.data || []
        const applicantResponses = await Promise.all(
          jobs.map((job) => jobApi.getApplicantsByJob(job.id).then((res) => ({ job, applicants: res.data?.data || [] })))
        )

        const interviews = applicantResponses.flatMap(({ job, applicants }) =>
          applicants
            .filter((applicant) => applicant.interviewDateTime || applicant.status === 'INTERVIEW')
            .map((applicant) => ({
              id: applicant.id,
              name: applicant.name,
              email: applicant.email,
              title: job.title,
              company: job.company,
              scheduledAt: applicant.interviewDateTime,
              status: applicant.status,
            }))
        )

        setItems(interviews.sort((a, b) => new Date(a.scheduledAt || 0) - new Date(b.scheduledAt || 0)))
      } catch {
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user?.userId])

  const summary = useMemo(() => {
    const scheduled = items.filter((item) => item.scheduledAt).length
    const today = items.filter((item) => {
      if (!item.scheduledAt) return false
      return new Date(item.scheduledAt).toDateString() === new Date().toDateString()
    }).length
    const awaitingSchedule = items.filter((item) => !item.scheduledAt).length
    return { scheduled, today, awaitingSchedule }
  }, [items])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Scheduled interviews', value: summary.scheduled, icon: CalendarDays },
          { label: 'Happening today', value: summary.today, icon: Clock3 },
          { label: 'Awaiting schedule', value: summary.awaitingSchedule, icon: Video },
        ].map(({ label, value, icon: Icon }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
            <div className="mb-3 inline-flex rounded-2xl bg-blue-50 p-2.5 text-blue-600"><Icon size={18} /></div>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            <p className="mt-1 text-sm text-gray-500">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Interview calendar</h2>
          <p className="text-sm text-gray-500">All interviews scheduled from your current hiring pipelines.</p>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 py-8 text-sm text-gray-500">
            <div className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            Loading interviews…
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">
            No interviews scheduled yet.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.name || 'Candidate'}</p>
                    <p className="text-sm text-gray-500">{item.title} · {item.company}</p>
                    <p className="mt-1 text-xs text-gray-400">{item.email || 'No email available'}</p>
                  </div>
                  <div className="text-sm text-right">
                    <p className="font-medium text-blue-600">{item.scheduledAt ? new Date(item.scheduledAt).toLocaleString() : 'Pending schedule'}</p>
                    <p className="mt-1 text-xs text-gray-500">Status: {item.status || 'INTERVIEW'}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
