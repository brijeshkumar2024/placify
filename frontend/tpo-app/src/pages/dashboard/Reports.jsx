import { useState } from 'react'
import { FileBarChart, Download, TrendingUp, Award, Users, Briefcase } from 'lucide-react'

const reportStats = [
  { label: 'Total eligible students', value: '248', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Students placed', value: '169', icon: Award, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Companies visited', value: '24', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Avg CTC (LPA)', value: '18.4', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
]

const topRecruiters = [
  { company: 'TCS', offers: 42, avgCtc: '7 LPA' },
  { company: 'Infosys', offers: 38, avgCtc: '8 LPA' },
  { company: 'Wipro', offers: 29, avgCtc: '7.5 LPA' },
  { company: 'Google', offers: 4, avgCtc: '45 LPA' },
  { company: 'Microsoft', offers: 6, avgCtc: '40 LPA' },
]

const branchStats = [
  { branch: 'Computer Science', eligible: 80, placed: 68, pct: 85 },
  { branch: 'Information Technology', eligible: 60, placed: 48, pct: 80 },
  { branch: 'Electronics', eligible: 55, placed: 32, pct: 58 },
  { branch: 'Mechanical', eligible: 53, placed: 21, pct: 40 },
]

export default function Reports() {
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => { setGenerating(false); setGenerated(true) }, 2000)
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Placement reports</h2>
          <p className="text-gray-500 text-sm mt-1">Academic year 2025-2026</p>
        </div>
        <button onClick={handleGenerate} disabled={generating}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-xl transition-all">
          <Download size={16} />
          {generating ? 'Generating...' : generated ? 'Download PDF' : 'Generate report'}
        </button>
      </div>

      {generated && (
        <div className="bg-green-50 border border-green-100 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
          <FileBarChart size={20} className="text-green-600" />
          <p className="text-sm text-green-700 font-medium">Placement report generated — Batch 2026 — ready to download</p>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-6">
        {reportStats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top recruiters</h3>
          <div className="space-y-3">
            {topRecruiters.map((r, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center font-bold text-blue-700 text-sm">
                    {r.company[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.company}</p>
                    <p className="text-xs text-gray-400">{r.avgCtc}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900">{r.offers} offers</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Branch-wise placement</h3>
          <div className="space-y-4">
            {branchStats.map((b, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm text-gray-700">{b.branch}</p>
                  <p className="text-sm font-semibold text-gray-900">{b.pct}%</p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${b.pct >= 75 ? 'bg-green-500' : b.pct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                    style={{ width: `${b.pct}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{b.placed} of {b.eligible} students placed</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">CTC distribution</h3>
        <div className="flex items-end gap-3 h-32">
          {[
            { range: '0-5 LPA', count: 12, pct: 25 },
            { range: '5-10 LPA', count: 68, pct: 100 },
            { range: '10-20 LPA', count: 54, pct: 79 },
            { range: '20-30 LPA', count: 22, pct: 32 },
            { range: '30+ LPA', count: 13, pct: 19 },
          ].map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <p className="text-xs font-semibold text-gray-700">{d.count}</p>
              <div className="w-full bg-blue-100 hover:bg-blue-400 rounded-t-md transition-all"
                style={{ height: `${d.pct}%` }} />
              <p className="text-xs text-gray-400 text-center">{d.range}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}