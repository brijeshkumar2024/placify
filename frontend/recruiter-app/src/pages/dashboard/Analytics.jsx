import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { jobApi } from '../../services/api'
import useAuthStore from '../../store/authStore'

export default function Analytics() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (!user?.userId) return

    jobApi.getRecruiterStats(user.userId)
      .then((res) => setStats(res.data?.data || null))
      .catch(() => setStats(null))
  }, [user?.userId])

  const chartData = useMemo(() => {
    const funnel = stats?.funnel || {}
    return [
      { stage: 'Applied', count: stats?.totalApplicants ?? 0 },
      { stage: 'Shortlisted', count: funnel.shortlisted ?? 0 },
      { stage: 'Interview', count: funnel.interview ?? 0 },
      { stage: 'Hired', count: funnel.hired ?? 0 },
    ]
  }, [stats])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Selection rate', value: `${(stats?.selectionRate ?? 0).toFixed(1)}%` },
          { label: 'Top skill clusters', value: stats?.topSkills?.length ?? 0 },
          { label: 'Applicants reviewed', value: stats?.totalApplicants ?? 0 },
        ].map(({ label, value }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Hiring conversion insights</h2>
          <p className="text-sm text-gray-500">Premium-style analytics snapshot for your recruiting funnel.</p>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="stage" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" allowDecimals={false} />
              <Tooltip cursor={{ fill: '#EFF6FF' }} />
              <Bar dataKey="count" fill="#2563EB" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
