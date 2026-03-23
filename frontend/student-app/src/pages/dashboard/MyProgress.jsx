import { Award, Briefcase, Mic, FileText, TrendingUp, Star } from 'lucide-react'

const activityData = [4, 7, 3, 8, 5, 9, 6, 4, 7, 8, 5, 3, 9, 7]

const skillScores = [
  { skill: 'Data Structures', score: 72, color: 'bg-blue-600' },
  { skill: 'Algorithms', score: 65, color: 'bg-purple-500' },
  { skill: 'System Design', score: 48, color: 'bg-amber-500' },
  { skill: 'Core CS', score: 80, color: 'bg-green-500' },
  { skill: 'Communication', score: 85, color: 'bg-pink-500' },
]

const interviews = [
  { domain: 'DSA', score: 74, date: '20 Mar 2026', questions: 3 },
  { domain: 'HR', score: 88, date: '18 Mar 2026', questions: 3 },
  { domain: 'Core CS', score: 71, date: '15 Mar 2026', questions: 3 },
]

const badges = [
  { icon: '🎯', label: 'First apply', earned: true },
  { icon: '🔥', label: '5 day streak', earned: true },
  { icon: '💬', label: 'First interview', earned: true },
  { icon: '⭐', label: 'Top 10% fit', earned: false },
  { icon: '🏆', label: 'Offer received', earned: false },
  { icon: '🚀', label: 'Profile complete', earned: false },
]

const statCards = [
  { label: 'Readiness score', value: '72', unit: '/100', icon: Award, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Jobs applied', value: '6', unit: '', icon: Briefcase, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Mock interviews', value: '3', unit: '', icon: Mic, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Tasks completed', value: '8', unit: '/24', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
]

export default function MyProgress() {
  const maxActivity = Math.max(...activityData)

  return (
    <div className="p-8 max-w-4xl">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">My progress</h2>
        <p className="text-gray-500 text-sm mt-1">Track your placement preparation journey</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, unit, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-semibold text-gray-900">
              {value}<span className="text-base font-normal text-gray-400">{unit}</span>
            </p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">

        {/* Activity chart */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900">Daily activity</h3>
            <span className="text-xs text-gray-400">Last 14 days</span>
          </div>
          <div className="flex items-end gap-2 h-28">
            {activityData.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-blue-100 rounded-t-md transition-all hover:bg-blue-400"
                  style={{ height: `${(val / maxActivity) * 100}%`, minHeight: '4px' }}
                  title={`${val} tasks`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-400">14 days ago</span>
            <span className="text-xs text-gray-400">Today</span>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center text-center">
          <div className="text-5xl mb-2">🔥</div>
          <p className="text-3xl font-bold text-gray-900">5</p>
          <p className="text-sm font-medium text-gray-700 mt-0.5">day streak</p>
          <p className="text-xs text-gray-400 mt-2">Keep going — don't break it!</p>
          <div className="flex gap-1 mt-4">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                i < 5 ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-400'
              }`}>{d}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">

        {/* Skill scores */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} className="text-blue-600" />
            <h3 className="font-semibold text-gray-900">Skill scores</h3>
          </div>
          <div className="space-y-4">
            {skillScores.map(({ skill, score, color }) => (
              <div key={skill}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm text-gray-700">{skill}</p>
                  <p className="text-sm font-semibold text-gray-900">{score}%</p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`${color} h-2 rounded-full transition-all duration-700`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interview history */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Mic size={18} className="text-purple-600" />
            <h3 className="font-semibold text-gray-900">Interview history</h3>
          </div>
          <div className="space-y-3">
            {interviews.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Mic size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.domain}</p>
                    <p className="text-xs text-gray-400">{item.date} · {item.questions} questions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${item.score >= 80 ? 'text-green-600' : item.score >= 65 ? 'text-amber-600' : 'text-red-500'}`}>
                    {item.score}/100
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">Average score</p>
            <p className="text-sm font-semibold text-gray-900">
              {Math.round(interviews.reduce((a, b) => a + b.score, 0) / interviews.length)}/100
            </p>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Star size={18} className="text-amber-500" />
          <h3 className="font-semibold text-gray-900">Badges earned</h3>
          <span className="text-xs text-gray-400 ml-1">3 of 6</span>
        </div>
        <div className="grid grid-cols-6 gap-3">
          {badges.map(({ icon, label, earned }) => (
            <div
              key={label}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-center transition-all ${
                earned
                  ? 'bg-amber-50 border-amber-100'
                  : 'bg-gray-50 border-gray-100 opacity-40 grayscale'
              }`}
            >
              <span className="text-2xl">{icon}</span>
              <p className="text-xs text-gray-600 font-medium leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}