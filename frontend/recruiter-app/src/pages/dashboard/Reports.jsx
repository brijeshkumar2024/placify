import { motion } from 'framer-motion'
import { Download, FileText, Sparkles } from 'lucide-react'

const reportCards = [
  {
    title: 'Hiring summary',
    desc: 'Track applicant flow, interview throughput, and conversion wins.',
  },
  {
    title: 'Pipeline health',
    desc: 'Spot stalled candidates and identify roles that need attention.',
  },
  {
    title: 'Team performance',
    desc: 'Review recruiter activity and SLA-style follow-up metrics.',
  },
]

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="glass-card bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/15 p-2.5"><Sparkles size={18} /></div>
          <div>
            <h2 className="text-xl font-semibold">Reports & exports</h2>
            <p className="text-sm text-blue-100">Generate polished hiring reports for weekly reviews and stakeholder updates.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {reportCards.map((card) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
            <div className="mb-3 inline-flex rounded-2xl bg-blue-50 p-2.5 text-blue-600"><FileText size={18} /></div>
            <h3 className="text-base font-semibold text-gray-900">{card.title}</h3>
            <p className="mt-2 text-sm text-gray-500">{card.desc}</p>
            <button className="btn-premium mt-4 w-full justify-center">
              <Download size={14} /> Export
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
