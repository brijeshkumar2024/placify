import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Send, RotateCcw, ChevronRight, Award, Clock } from 'lucide-react'

const domains = [
  { id: 'dsa', label: 'Data Structures & Algorithms', icon: '🧮', desc: 'Arrays, trees, graphs, DP' },
  { id: 'system', label: 'System Design', icon: '🏗️', desc: 'Scalability, databases, APIs' },
  { id: 'hr', label: 'HR & Behavioural', icon: '🤝', desc: 'Situational, cultural fit' },
  { id: 'core', label: 'Core CS', icon: '💻', desc: 'OS, DBMS, Networks, OOP' },
]

const questions = {
  dsa: [
    { q: 'Explain the difference between a stack and a queue. When would you use each?', hint: 'Think about LIFO vs FIFO and real-world examples.' },
    { q: 'What is the time complexity of binary search and why?', hint: 'Consider how many elements are eliminated per step.' },
    { q: 'How would you detect a cycle in a linked list?', hint: 'Think about Floyd\'s tortoise and hare algorithm.' },
  ],
  system: [
    { q: 'How would you design a URL shortener like bit.ly?', hint: 'Consider hashing, database design, and scalability.' },
    { q: 'Explain the CAP theorem in distributed systems.', hint: 'Consistency, Availability, Partition tolerance — pick two.' },
    { q: 'How would you design WhatsApp\'s messaging system?', hint: 'Think about real-time messaging, storage, and delivery guarantees.' },
  ],
  hr: [
    { q: 'Tell me about yourself and why you want to join this company.', hint: 'Structure: background → skills → why this company.' },
    { q: 'Describe a time you faced a difficult challenge and how you overcame it.', hint: 'Use STAR method: Situation, Task, Action, Result.' },
    { q: 'Where do you see yourself in 5 years?', hint: 'Show ambition but stay realistic and company-aligned.' },
  ],
  core: [
    { q: 'What is a deadlock and how can it be prevented?', hint: 'Four conditions: mutual exclusion, hold and wait, no preemption, circular wait.' },
    { q: 'Explain the difference between SQL and NoSQL databases.', hint: 'Think about structure, scalability, and use cases.' },
    { q: 'What happens when you type a URL in the browser and press Enter?', hint: 'DNS → TCP → HTTP → render — cover each step.' },
  ],
}

const feedback = [
  { label: 'Technical accuracy', score: 78, color: 'bg-blue-600' },
  { label: 'Communication clarity', score: 85, color: 'bg-green-500' },
  { label: 'Confidence', score: 72, color: 'bg-purple-500' },
  { label: 'Completeness', score: 68, color: 'bg-amber-500' },
]

export default function MockInterview() {
  const [phase, setPhase] = useState('select') // select | interview | feedback
  const [domain, setDomain] = useState(null)
  const [qIndex, setQIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [answers, setAnswers] = useState([])
  const [recording, setRecording] = useState(false)
  const [timer, setTimer] = useState(120)
  const [paused, setPaused] = useState(true)
  const timerRef = useRef(null)
  const textareaRef = useRef(null)

  const currentQ = domain ? questions[domain.id][qIndex] : null
  const totalQ = domain ? questions[domain.id].length : 0

  useEffect(() => {
    if (!paused && timer > 0) {
      timerRef.current = setInterval(() => setTimer(t => t - 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [paused, timer])

  const startInterview = (d) => {
    setDomain(d)
    setPhase('interview')
    setQIndex(0)
    setAnswer('')
    setAnswers([])
    setTimer(120)
    setPaused(false)
  }

  const submitAnswer = () => {
    if (!answer.trim()) return
    setAnswers(prev => [...prev, { q: currentQ.q, a: answer }])
    if (qIndex + 1 < totalQ) {
      setQIndex(i => i + 1)
      setAnswer('')
      setTimer(120)
      setPaused(false)
    } else {
      setPaused(true)
      setPhase('feedback')
    }
  }

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const avgScore = Math.round(feedback.reduce((a, b) => a + b.score, 0) / feedback.length)

  if (phase === 'select') return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">Mock interview</h2>
        <p className="text-gray-500 text-sm mt-1">Choose a domain to start your AI-powered interview session</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {domains.map(d => (
          <button
            key={d.id}
            onClick={() => startInterview(d)}
            className="bg-white border border-gray-100 rounded-2xl p-6 text-left hover:border-blue-200 hover:shadow-sm transition-all group"
          >
            <div className="text-3xl mb-3">{d.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">{d.label}</h3>
            <p className="text-sm text-gray-500">{d.desc}</p>
            <div className="flex items-center gap-1 mt-4 text-blue-600 text-sm font-medium">
              Start session <ChevronRight size={14} />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 rounded-2xl p-5 border border-blue-100">
        <p className="text-sm text-blue-800 font-medium mb-1">How it works</p>
        <p className="text-sm text-blue-700">
          Each session has 3 questions. You have 2 minutes per question.
          Type your answer and submit. After the session you get a detailed feedback report with scores.
        </p>
      </div>
    </div>
  )

  if (phase === 'interview') return (
    <div className="p-8 max-w-3xl">

      {/* Progress bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{domain.icon}</span>
          <div>
            <h2 className="font-semibold text-gray-900">{domain.label}</h2>
            <p className="text-sm text-gray-500">Question {qIndex + 1} of {totalQ}</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-semibold ${
          timer <= 30 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700'
        }`}>
          <Clock size={14} />
          {formatTime(timer)}
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mb-6">
        {questions[domain.id].map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${
            i < qIndex ? 'bg-green-500' : i === qIndex ? 'bg-blue-600' : 'bg-gray-200'
          }`} />
        ))}
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-3">Question {qIndex + 1}</p>
        <p className="text-lg font-medium text-gray-900 leading-relaxed mb-4">{currentQ.q}</p>
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
          <p className="text-xs text-amber-700"><span className="font-semibold">Hint:</span> {currentQ.hint}</p>
        </div>
      </div>

      {/* Answer area */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <textarea
          ref={textareaRef}
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="Type your answer here... Be thorough and structured."
          rows={6}
          className="w-full text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none leading-relaxed"
        />
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRecording(r => !r)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                recording
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {recording ? <MicOff size={14} /> : <Mic size={14} />}
              {recording ? 'Stop recording' : 'Voice input'}
            </button>
            <span className="text-xs text-gray-400">{answer.length} chars</span>
          </div>
          <button
            onClick={submitAnswer}
            disabled={!answer.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium rounded-xl transition-all"
          >
            {qIndex + 1 === totalQ ? 'Finish' : 'Next question'}
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  )

  if (phase === 'feedback') return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Interview complete</h2>
        <p className="text-gray-500 text-sm mt-1">Here's your performance breakdown</p>
      </div>

      {/* Overall score */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4 flex items-center gap-6">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3"/>
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2563eb" strokeWidth="3"
              strokeDasharray={`${avgScore} 100`} strokeLinecap="round"/>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{avgScore}</p>
              <p className="text-xs text-gray-400">/100</p>
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award size={18} className="text-amber-500" />
            <p className="font-semibold text-gray-900">Overall score: {avgScore}/100</p>
          </div>
          <p className="text-sm text-gray-500">
            {avgScore >= 80 ? 'Excellent performance! You are well prepared.' :
             avgScore >= 65 ? 'Good effort. Focus on weaker areas to improve.' :
             'Keep practising. Consistent effort leads to improvement.'}
          </p>
          <p className="text-xs text-gray-400 mt-1">{domain.label} · {totalQ} questions</p>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <h3 className="font-semibold text-gray-900 mb-4">Score breakdown</h3>
        <div className="space-y-4">
          {feedback.map(({ label, score, color }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm text-gray-700">{label}</p>
                <p className="text-sm font-semibold text-gray-900">{score}/100</p>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className={`${color} h-2 rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Answers review */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Your answers</h3>
        <div className="space-y-4">
          {answers.map((a, i) => (
            <div key={i} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
              <p className="text-sm font-medium text-gray-900 mb-2">Q{i + 1}: {a.q}</p>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3 leading-relaxed">{a.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => { setPhase('select'); setDomain(null) }}
          className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all"
        >
          <RotateCcw size={16} /> Try another domain
        </button>
        <button
          onClick={() => startInterview(domain)}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all"
        >
          Retry this domain
        </button>
      </div>
    </div>
  )
}