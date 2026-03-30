import { useEffect, useMemo, useState } from 'react'
import { Award, Briefcase, Mic, FileText, TrendingUp, Star, AlertTriangle } from 'lucide-react'
import { jobApi, userApi, interviewApi } from '../../services/api'

const dayLabel = (offsetFromToday) => {
  const d = new Date()
  d.setDate(d.getDate() - offsetFromToday)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const difficultyColor = (score) => (
  score >= 80 ? 'text-green-600' : score >= 65 ? 'text-amber-600' : 'text-red-500'
)

export default function MyProgress() {
  const [profile, setProfile] = useState(null)
  const [applications, setApplications] = useState([])
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      userApi.getProfile(),
      jobApi.getMyApplications(),
      interviewApi.getHistory(),
    ])
      .then(([pRes, aRes, iRes]) => {
        setProfile(pRes.data?.data || null)
        setApplications(aRes.data?.data || [])
        setInterviews(iRes.data?.data || [])
      })
      .catch(() => setError('Could not load analytics.'))
      .finally(() => setLoading(false))
  }, [])

  const totalApplied = applications.length
  const roundsCleared = applications.filter(app =>
    ['SHORTLISTED', 'INTERVIEW', 'OFFER', 'HIRED'].includes(app.status)
  ).length

  const readinessScore = useMemo(() => {
    const profileScore = profile?.completionScore ?? 0
    const appScore = Math.min(40, totalApplied * 10)
    const roundScore = Math.min(20, roundsCleared * 5)
    return Math.max(10, Math.min(100, Math.round(profileScore + appScore + roundScore)))
  }, [profile, totalApplied, roundsCleared])

  const tasksCompleted = (profile?.completionScore ?? 0) >= 80 ? 8 : 3
  const tasksTotal = 24

  // activity over last 14 days based on application appliedAt
  const activityData = useMemo(() => {
    const arr = Array(14).fill(0)
    applications.forEach(app => {
      if (!app.appliedAt) return
      const daysAgo = Math.floor((Date.now() - new Date(app.appliedAt).getTime()) / (1000 * 60 * 60 * 24))
      if (daysAgo >= 0 && daysAgo < 14) arr[13 - daysAgo] += 1 // oldest->newest
    })
    return arr
  }, [applications])
  const maxActivity = activityData.length ? Math.max(...activityData, 1) : 1

  const skillScores = useMemo(() => {
    const skills = profile?.skills || []
    if (!skills.length) {
      return [
        { skill: 'Profile completeness', score: profile?.completionScore ?? 0, color: 'bg-blue-600' },
      ]
    }
    return skills.slice(0, 5).map((s, i) => ({
      skill: s,
      score: Math.min(95, 60 + (i * 7)), // simple gradation until backend provides per-skill
      color: ['bg-blue-600', 'bg-purple-500', 'bg-amber-500', 'bg-green-500', 'bg-pink-500'][i % 5],
    }))
  }, [profile])

  const interviewCards = useMemo(() => {
    return interviews.map(sess => ({
      domain: sess.domain,
      score: sess.finalReport?.overallScore ?? 0,
      date: new Date(sess.completedAt || sess.createdAt || Date.now()).toLocaleDateString(),
      questions: sess.questionAnswers?.length || 0,
    }))
  }, [interviews])

  const avgInterviewScore = interviewCards.length
    ? Math.round(interviewCards.reduce((a, b) => a + (b.score || 0), 0) / interviewCards.length)
    : 0

  const statCards = [
    { label: 'Readiness score', value: readinessScore, unit: '/100', icon: Award, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Jobs applied', value: totalApplied, unit: '', icon: Briefcase, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Mock interviews', value: interviews.length, unit: '', icon: Mic, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Tasks completed', value: `${tasksCompleted}`, unit: `/${tasksTotal}`, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  const badges = useMemo(() => {
    const firstApply = totalApplied > 0
    const fiveStreak = activityData.filter(v => v > 0).length >= 5
    const firstInterview = interviews.length > 0
    const offer = applications.some(app => ['OFFER', 'HIRED'].includes(app.status))
    const profileComplete = (profile?.completionScore ?? 0) >= 80
    const topFit = applications.some(app => (app.fitScore || 0) >= 80)
    return [
      { icon: '🎯', label: 'First apply', earned: firstApply },
      { icon: '🔥', label: '5 day streak', earned: fiveStreak },
      { icon: '💬', label: 'First interview', earned: firstInterview },
      { icon: '⭐', label: 'Top 80% fit', earned: topFit },
      { icon: '🏆', label: 'Offer received', earned: offer },
      { icon: '🚀', label: 'Profile complete', earned: profileComplete },
    ]
  }, [applications, activityData, interviews, profile, totalApplied])

  if (loading) return <div className="p-8 text-gray-500">Loading analytics…</div>
  if (error) return (
    <div className="p-8">
      <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2">
        <AlertTriangle size={16} /> {error}
      </div>
    </div>
  )

  return (
    <div className="p-8 max-w-4xl">

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
                  title={`${val} applications`}
                />
                <span className="text-[10px] text-gray-400">{(i % 3 === 0 || i === activityData.length -1) ? dayLabel(activityData.length - 1 - i) : ''}</span>
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
          <p className="text-3xl font-bold text-gray-900">
            {activityData.filter(v => v > 0).length >= 5 ? '5+' : activityData.filter(v => v > 0).length}
          </p>
          <p className="text-sm font-medium text-gray-700 mt-0.5">days active</p>
          <p className="text-xs text-gray-400 mt-2">Apply or practice to keep your streak.</p>
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
          {interviewCards.length === 0 ? (
            <p className="text-sm text-gray-400">No interviews yet. Start a mock interview to see progress.</p>
          ) : (
            <>
              <div className="space-y-3">
                {interviewCards.map((item, i) => (
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
                      <p className={`text-sm font-semibold ${difficultyColor(item.score)}`}>
                        {item.score}/100
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">Average score</p>
                <p className="text-sm font-semibold text-gray-900">
                  {avgInterviewScore}/100
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Star size={18} className="text-amber-500" />
          <h3 className="font-semibold text-gray-900">Badges earned</h3>
          <span className="text-xs text-gray-400 ml-1">{badges.filter(b => b.earned).length} of {badges.length}</span>
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
