import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Briefcase, Clock3, Users } from 'lucide-react'
import { jobApi } from '../../services/api'
import useAuthStore from '../../store/authStore'

const listMotion = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export default function ApplicantsHub() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.userId) return

    setLoading(true)
    jobApi.getRecruiterJobs(user.userId, null)
      .then((res) => setJobs(res.data?.data || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false))
  }, [user?.userId])

  const totals = useMemo(() => {
    const totalApplicants = jobs.reduce((sum, job) => sum + (job.applicantCount || 0), 0)
    const activeJobs = jobs.filter((job) => job.status === 'ACTIVE').length
    const closingSoon = jobs.filter((job) => {
      if (!job.deadline) return false
      const diff = new Date(job.deadline) - new Date()
      return diff > 0 && diff < 1000 * 60 * 60 * 24 * 7
    }).length

    return { totalApplicants, activeJobs, closingSoon }
  }, [jobs])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Applicants in pipeline', value: totals.totalApplicants, icon: Users, accent: 'from-blue-500/15 to-blue-100/60' },
          { label: 'Active jobs', value: totals.activeJobs, icon: Briefcase, accent: 'from-indigo-500/15 to-indigo-100/60' },
          { label: 'Closing this week', value: totals.closingSoon, icon: Clock3, accent: 'from-amber-500/20 to-amber-100/70' },
        ].map(({ label, value, icon: Icon, accent }) => (
          <motion.div
            key={label}
            variants={listMotion}
            initial="hidden"
            animate="show"
            className={`glass-card relative overflow-hidden p-5 bg-gradient-to-br ${accent}`}
          >
            <div className="mb-3 inline-flex rounded-2xl bg-white p-2.5 text-blue-600 shadow-sm">
              <Icon size={18} />
            </div>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            <p className="mt-1 text-sm text-gray-500">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Applicant queues by job</h2>
            <p className="text-sm text-gray-500">Open a job pipeline to shortlist candidates, rate profiles, and schedule interviews.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 py-8 text-sm text-gray-500">
            <div className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            Loading applicant queues…
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">
            No jobs posted yet. Publish a role to start receiving applicants.
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <motion.button
                key={job.id}
                variants={listMotion}
                initial="hidden"
                animate="show"
                onClick={() => navigate(`/dashboard/applicants/${job.id}`)}
                className="w-full rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/40"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{job.title}</p>
                    <p className="text-sm text-gray-500">{job.company} · {job.location || 'Remote'}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">{job.applicantCount || 0} applicants</span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">{job.status || 'ACTIVE'}</span>
                    <span className="inline-flex items-center gap-1 text-blue-600">
                      Open queue <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
