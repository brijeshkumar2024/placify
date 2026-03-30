import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronRight, Clock, History, Play, RotateCcw, Send, Zap, AlertTriangle, Loader2 } from 'lucide-react'
import { interviewApi } from '../../services/api'

// Domain IDs must match backend enum: DSA | SYSTEM_DESIGN | HR | CORE_CS
const DOMAINS = [
  { id: 'DSA', label: 'Data Structures & Algorithms', icon: '🧮', desc: 'Arrays, trees, graphs, DP', color: 'from-blue-500 to-blue-600' },
  { id: 'SYSTEM_DESIGN', label: 'System Design', icon: '🏗️', desc: 'Scalability, databases, APIs', color: 'from-purple-500 to-purple-600' },
  { id: 'HR', label: 'HR & Behavioural', icon: '🤝', desc: 'Situational, cultural fit', color: 'from-green-500 to-green-600' },
  { id: 'CORE_CS', label: 'Core CS', icon: '💻', desc: 'OS, DBMS, Networks, OOP', color: 'from-amber-500 to-amber-600' },
]

const DIFFICULTY_COLORS = {
  EASY: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', active: 'bg-green-600 text-white' },
  MEDIUM: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', active: 'bg-amber-500 text-white' },
  HARD: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', active: 'bg-red-600 text-white' },
}

const TIMER_BY_DIFFICULTY = { EASY: 180, MEDIUM: 120, HARD: 90 }

export default function MockInterview() {
  const [phase, setPhase] = useState('select') // select | interview | feedback
  const [difficulty, setDifficulty] = useState('MEDIUM')
  const [domainId, setDomainId] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [question, setQuestion] = useState(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [isLastQuestion, setIsLastQuestion] = useState(false)
  const [answer, setAnswer] = useState('')
  const [evaluation, setEvaluation] = useState(null)
  const [history, setHistory] = useState([])
  const [finalReport, setFinalReport] = useState(null)
  const [startingId, setStartingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [timer, setTimer] = useState(TIMER_BY_DIFFICULTY[difficulty])
  const timerRef = useRef(null)

  const formatTimestamp = (ts) => ts
    ? new Date(ts).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : 'Just now'

  // Load history from backend
  useEffect(() => {
    interviewApi.getHistory()
      .then(res => setHistory(res.data?.data || []))
      .catch(() => setHistory([]))
  }, [])

  // Countdown timer
  useEffect(() => {
    if (phase !== 'interview') {
      clearInterval(timerRef.current)
      return
    }
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          handleSubmit(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, questionIndex, submitting])

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  // Derived stats from history
  const categoryProgress = useMemo(() => {
    return DOMAINS.map(d => {
      const sessions = history.filter(h => h.domain === d.id)
      const attempts = sessions.length
      const best = attempts
        ? Math.max(...sessions.map(s => s.finalReport?.overallScore || 0))
        : 0
      return { ...d, attempts, best }
    })
  }, [history])

  const lastSession = history[0]

  const handleStart = (domain) => {
    setStartingId(domain.id)
    setError('')
    interviewApi.start(domain.id, difficulty, 5)
      .then(res => {
        const data = res.data?.data
        setSessionId(data.sessionId)
        setQuestion(data.question)
        setQuestionIndex(data.questionIndex)
        setTotalQuestions(data.totalQuestions)
        setIsLastQuestion(data.isLastQuestion)
        setDomainId(domain.id)
        setPhase('interview')
        setAnswer('')
        setEvaluation(null)
        setTimer(TIMER_BY_DIFFICULTY[difficulty])
      })
      .catch(() => setError('Could not start interview. Please try again.'))
      .finally(() => setStartingId(null))
  }

  const handleSubmit = (auto = false) => {
    if (!sessionId) return
    if (submitting) return
    setSubmitting(true)
    setError('')
    const payloadAnswer = (answer || '').trim() || (auto ? '[Auto-submitted: no answer]' : '')
    interviewApi.submitAnswer(sessionId, payloadAnswer)
      .then(res => {
        const data = res.data?.data
        setEvaluation(data.evaluation || null)
        setQuestionIndex(data.questionIndex ?? questionIndex + 1)
        setIsLastQuestion(data.isLastQuestion)
        setFinalReport(data.finalReport || null)

        if (data.isLastQuestion) {
          setPhase('feedback')
          setQuestion(null)
          setAnswer('')
          setTimer(0)
          // refresh history to include this run
          interviewApi.getHistory().then(r => setHistory(r.data?.data || [])).catch(() => {})
        } else {
          setQuestion(data.question)
          setAnswer('')
          setTimer(TIMER_BY_DIFFICULTY[difficulty])
        }
      })
      .catch(() => setError('Could not submit answer. Please retry.'))
      .finally(() => setSubmitting(false))
  }

  const handleAbandon = () => {
    if (!sessionId) {
      resetToSelect()
      return
    }
    interviewApi.abandon(sessionId).catch(() => {})
    resetToSelect()
  }

  const resetToSelect = () => {
    clearInterval(timerRef.current)
    setPhase('select')
    setSessionId(null)
    setQuestion(null)
    setQuestionIndex(0)
    setTotalQuestions(0)
    setIsLastQuestion(false)
    setAnswer('')
    setEvaluation(null)
    setFinalReport(null)
    setTimer(TIMER_BY_DIFFICULTY[difficulty])
    setError('')
  }

  const renderDifficultyPills = () => (
    <div className="mb-6">
      <p className="text-sm font-medium text-gray-700 mb-3">Select difficulty</p>
      <div className="flex gap-3">
        {['EASY', 'MEDIUM', 'HARD'].map(d => (
          <button
            key={d}
            onClick={() => { setDifficulty(d); setTimer(TIMER_BY_DIFFICULTY[d]) }}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all capitalize ${
              difficulty === d
                ? DIFFICULTY_COLORS[d].active
                : `${DIFFICULTY_COLORS[d].bg} ${DIFFICULTY_COLORS[d].text} ${DIFFICULTY_COLORS[d].border}`
            }`}
          >
            {d.toLowerCase()}
            <span className="ml-2 text-xs opacity-70">
              {TIMER_BY_DIFFICULTY[d] / 60}m/q
            </span>
          </button>
        ))}
      </div>
    </div>
  )

  // SELECT PHASE
  if (phase === 'select') return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Mock interview</h2>
          <p className="text-gray-500 text-sm mt-1">AI-powered interview prep — choose a domain and difficulty</p>
        </div>
        <button
          onClick={() => setHistory(h => [...h])}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all"
        >
          <History size={16} /> {history.length} attempts
        </button>
      </div>

      {renderDifficultyPills()}

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-8">
        {DOMAINS.map(d => {
          const stats = categoryProgress.find(c => c.id === d.id) || {}
          const loading = startingId === d.id
          return (
            <button
              key={d.id}
              onClick={() => !loading && handleStart(d)}
              className="bg-white border border-gray-100 rounded-2xl p-6 text-left hover:border-blue-200 hover:shadow-md transition-all group relative overflow-hidden disabled:opacity-60"
              disabled={loading}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${d.color} opacity-5 rounded-bl-full`} />
              <div className="text-3xl mb-3">{d.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">{d.label}</h3>
              <p className="text-sm text-gray-500 mb-4">{d.desc}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{stats.attempts || 0} attempts</span>
                  {stats.best > 0 && <span className="text-green-600 font-medium">Best: {stats.best}/100</span>}
                </div>
                <div className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                  {loading ? <Loader2 className="animate-spin" size={16} /> : 'Start'} <ChevronRight size={14} />
                </div>
              </div>
              {stats.best > 0 && (
                <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full bg-gradient-to-r ${d.color}`}
                    style={{ width: `${stats.best}%` }}
                  />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {lastSession && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-900">Last session: {lastSession.domain}</p>
            <p className="text-xs text-blue-600 mt-0.5 capitalize">
              {lastSession.difficulty?.toLowerCase()} · Score: {lastSession.finalReport?.overallScore ?? '—'}/100 · {formatTimestamp(lastSession.completedAt || lastSession.createdAt)}
            </p>
          </div>
          <button
            onClick={() => {
              const d = DOMAINS.find(x => x.id === lastSession.domain)
              if (d) {
                setDifficulty(lastSession.difficulty || 'MEDIUM')
                handleStart(d)
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all"
          >
            <Play size={14} /> Retry
          </button>
        </div>
      )}

      <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <History size={16} /> Recent history
        </h3>
        {history.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No sessions yet. Start your first interview!</p>
        ) : (
          <div className="space-y-2">
              {history.slice(0, 8).map(s => (
                <div key={s.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{DOMAINS.find(d => d.id === s.domain)?.icon || '📋'}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.domain}</p>
                      <p className="text-xs text-gray-400 capitalize">{s.difficulty?.toLowerCase()} · {formatTimestamp(s.completedAt || s.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${((s.finalReport?.overallScore ?? 0) >= 80) ? 'text-green-600' : ((s.finalReport?.overallScore ?? 0) >= 65 ? 'text-amber-600' : 'text-red-500')}`}>
                      {s.finalReport?.overallScore ?? '—'}/100
                  </span>
                  <div className={`w-2 h-2 rounded-full ${((s.finalReport?.overallScore ?? 0) >= 80) ? 'bg-green-500' : ((s.finalReport?.overallScore ?? 0) >= 65 ? 'bg-amber-500' : 'bg-red-400')}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // INTERVIEW PHASE
  if (phase === 'interview') return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{DOMAINS.find(d => d.id === domainId)?.icon}</span>
          <div>
            <h2 className="font-semibold text-gray-900">{DOMAINS.find(d => d.id === domainId)?.label}</h2>
            <p className="text-sm text-gray-500 capitalize">
              {difficulty.toLowerCase()} · Question {questionIndex + 1} of {totalQuestions}
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-semibold transition-all ${
          timer <= 30 ? 'bg-red-50 text-red-600 animate-pulse' : timer <= 60 ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-700'
        }`}>
          <Clock size={14} />
          {formatTime(timer)}
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      <div className="w-full bg-gray-100 rounded-full h-1 mb-6">
        <div
          className={`h-1 rounded-full transition-all duration-1000 ${
            timer <= 30 ? 'bg-red-500' : timer <= 60 ? 'bg-amber-500' : 'bg-blue-600'
          }`}
          style={{ width: `${(timer / TIMER_BY_DIFFICULTY[difficulty]) * 100}%` }}
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${DIFFICULTY_COLORS[difficulty].bg} ${DIFFICULTY_COLORS[difficulty].text}`}>
            <Zap size={10} className="inline mr-1" />{difficulty.toLowerCase()}
          </span>
          <span className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Question {questionIndex + 1}</span>
        </div>
        <p className="text-lg font-medium text-gray-900 leading-relaxed mb-4">{question}</p>
      </div>

      {evaluation && (
        <div className="bg-green-50 border border-green-100 text-sm text-green-800 rounded-2xl px-4 py-3 mb-4">
          <p className="font-semibold">Previous answer feedback</p>
          <p className="mt-1">{evaluation.feedback}</p>
          {evaluation.correctAnswer && <p className="mt-1 text-green-900"><span className="font-semibold">Suggested answer:</span> {evaluation.correctAnswer}</p>}
          {evaluation.improvements && <p className="mt-1"><span className="font-semibold">Improvements:</span> {evaluation.improvements}</p>}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <textarea
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
          rows={6}
          className="w-full text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none leading-relaxed"
        />
        <div className="flex items-center justify-between pt-3 border-top border-gray-100">
          <span className="text-xs text-gray-400">{answer.length} chars</span>
          <div className="flex gap-2">
            <button
              onClick={handleAbandon}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
              type="button"
            >
              Abandon
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white text-sm font-medium rounded-xl transition-all"
              type="button"
            >
              {submitting ? <Loader2 className="animate-spin" size={16} /> : (isLastQuestion ? 'Finish' : 'Next')}
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // FEEDBACK PHASE
  const report = finalReport || {}
  const questionAnswers = report.questionAnswers || []
  const breakdown = report.topicBreakdown || []

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Interview complete</h2>
        <p className="text-gray-500 text-sm mt-1">Here is your performance breakdown</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4 flex items-center gap-6">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3"/>
            <circle cx="18" cy="18" r="15.9" fill="none"
              stroke="#2563eb"
              strokeWidth="3" strokeDasharray={`${report.overallScore || 0} 100`} strokeLinecap="round"/>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{report.overallScore ?? '—'}</p>
              <p className="text-xs text-gray-400">/100</p>
            </div>
          </div>
        </div>
        <div>
          <p className="font-semibold text-gray-900">Overall score: {report.overallScore ?? '—'}/100</p>
          <p className="text-sm text-gray-500">{report.overallFeedback || 'No feedback provided.'}</p>
          <p className="text-xs text-gray-400 mt-1">{DOMAINS.find(d => d.id === domainId)?.label} · {totalQuestions} questions</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <h3 className="font-semibold text-gray-900 mb-3">Strengths & weaknesses</h3>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="bg-green-50 border border-green-100 rounded-xl p-3">
            <p className="font-semibold text-green-800 mb-1">Strengths</p>
            <ul className="list-disc list-inside space-y-1 text-green-900">
              {(report.strengths || ['No strengths detected yet.']).map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
            <p className="font-semibold text-amber-800 mb-1">Weaknesses</p>
            <ul className="list-disc list-inside space-y-1 text-amber-900">
              {(report.weaknesses || ['No weaknesses provided.']).map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <h3 className="font-semibold text-gray-900 mb-3">Suggestions</h3>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          {(report.suggestions || ['No suggestions provided.']).map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>

      {breakdown.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Topic breakdown</h3>
          <div className="space-y-3">
            {breakdown.map((b, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-gray-700">{b.topic}</p>
                  <p className="text-sm font-semibold text-gray-900">{b.score}/100</p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${b.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Question review</h3>
        {questionAnswers.length === 0 ? (
          <p className="text-sm text-gray-500">No question details available.</p>
        ) : (
          <div className="space-y-4 text-sm text-gray-700">
            {questionAnswers.map((qa, i) => (
              <div key={i} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                <p className="font-semibold text-gray-900 mb-1">Q{i + 1}: {qa.question}</p>
                <p className="text-gray-700 mb-1"><span className="font-semibold">Your answer:</span> {qa.answer}</p>
                {qa.evaluation && <p className="text-gray-700 mb-1"><span className="font-semibold">Feedback:</span> {qa.evaluation.feedback}</p>}
                {qa.evaluation?.correctAnswer && <p className="text-gray-700 mb-1"><span className="font-semibold">Correct answer:</span> {qa.evaluation.correctAnswer}</p>}
                {qa.evaluation?.improvements && <p className="text-gray-700"><span className="font-semibold">Improvements:</span> {qa.evaluation.improvements}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={resetToSelect}
          className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all"
        >
          <RotateCcw size={16} /> Try another domain
        </button>
        <button
          onClick={() => {
            const d = DOMAINS.find(x => x.id === domainId)
            if (d) handleStart(d)
          }}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all"
        >
          Retry this domain
        </button>
      </div>
    </div>
  )
}
