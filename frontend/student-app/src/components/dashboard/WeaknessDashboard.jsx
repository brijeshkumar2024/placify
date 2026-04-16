import React, { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Target, TrendingUp, AlertCircle, BookOpen } from 'lucide-react'
import { analyticsApi } from '../../services/api'

export default function WeaknessDashboard() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsApi.getWeaknessAnalysis()
      .then((res) => setData(res?.data?.data?.items || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [])

  const weakAreas = useMemo(() => data.filter((d) => d.score < 60).sort((a, b) => a.score - b.score), [data])

  if (loading) {
    return <div className="h-48 rounded-xl bg-gray-800/50 animate-pulse border border-gray-700"></div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 border border-gray-800/60 bg-gray-900/50 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/30 transition-all duration-500"></div>
          <div className="flex items-center gap-3 mb-6">
            <Target className="text-blue-500" />
            <h3 className="text-lg font-semibold text-white">AI Focus Areas</h3>
            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30 ml-auto flex items-center gap-1">
              <AlertCircle size={12} /> Needs Improvement
            </span>
          </div>

          <div className="space-y-4">
            {weakAreas.map((item) => (
              <div key={item.subtopic} className="space-y-2">
                <div className="flex justify-between text-sm text-gray-300">
                  <span className="font-medium text-white">{item.subtopic}</span>
                  <span className="text-gray-400">{item.score}% Competency</span>
                </div>
                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full relative"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
            {weakAreas.length === 0 && (
              <div className="text-center py-6 text-gray-500">You have no identified weak areas right now.</div>
            )}
          </div>
        </div>

        <div className="glass-card p-6 border border-gray-800/60 bg-gray-900/50 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/30 transition-all duration-500"></div>
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="text-indigo-400" />
            <h3 className="text-lg font-semibold text-white">Your AI Learning Plan</h3>
          </div>

          <div className="relative border-l border-gray-700 ml-3 space-y-6">
            {weakAreas.slice(0, 3).map((item, idx) => (
              <div key={item.subtopic} className="relative pl-6">
                <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-red-500 rounded-full ring-4 ring-gray-900"></div>
                <h4 className="text-white text-sm font-medium">Day {idx + 1}: Master {item.subtopic}</h4>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">{item.feedback || 'Review fundamentals and solve 3 focused problems.'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-6 border border-gray-800/60 bg-gray-900/50 rounded-2xl h-80 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="text-emerald-500" />
          <h3 className="text-lg font-semibold text-white">Historical Evaluation Spread</h3>
        </div>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="subtopic" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: '#1f2937' }} contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.subtopic} fill={entry.score < 60 ? '#ef4444' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
