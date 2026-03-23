import { useState } from 'react'
import { CheckCircle, Circle, Lock, ChevronDown, ChevronUp, Zap, Target, TrendingUp } from 'lucide-react'

const roadmap = [
  {
    week: 1,
    title: 'Foundation — Arrays and Strings',
    status: 'completed',
    tasks: [
      { text: 'Solve 10 easy array problems on LeetCode', done: true },
      { text: 'Learn two pointer technique', done: true },
      { text: 'Practice sliding window problems', done: true },
      { text: 'Revise string manipulation methods in Java', done: true },
    ],
    tip: 'Arrays are asked in 90% of placement tests. Master them first.',
  },
  {
    week: 2,
    title: 'Linked Lists and Recursion',
    status: 'completed',
    tasks: [
      { text: 'Implement singly and doubly linked list from scratch', done: true },
      { text: 'Solve reverse linked list, detect cycle', done: true },
      { text: 'Understand recursion with factorial and fibonacci', done: false },
      { text: 'Solve 5 recursion problems', done: false },
    ],
    tip: 'Linked list + recursion questions are extremely common in product companies.',
  },
  {
    week: 3,
    title: 'Stacks, Queues and Hashing',
    status: 'current',
    tasks: [
      { text: 'Implement stack and queue using arrays', done: true },
      { text: 'Solve valid parentheses, next greater element', done: false },
      { text: 'Learn HashMap internals and collision handling', done: false },
      { text: 'Solve 8 hashing problems', done: false },
    ],
    tip: 'You are here. Focus on completing this week before moving ahead.',
  },
  {
    week: 4,
    title: 'Trees and Binary Search Trees',
    status: 'upcoming',
    tasks: [
      { text: 'Learn tree traversals — inorder, preorder, postorder', done: false },
      { text: 'Solve level order traversal, height of tree', done: false },
      { text: 'Understand BST insertion, deletion, search', done: false },
      { text: 'Solve 10 tree problems', done: false },
    ],
    tip: 'Trees appear in 70% of product company interviews.',
  },
  {
    week: 5,
    title: 'Graphs and BFS/DFS',
    status: 'locked',
    tasks: [
      { text: 'Learn graph representation — adjacency list and matrix', done: false },
      { text: 'Implement BFS and DFS', done: false },
      { text: 'Solve number of islands, connected components', done: false },
      { text: 'Learn topological sort', done: false },
    ],
    tip: 'Graph problems are asked in top-tier companies like Google and Amazon.',
  },
  {
    week: 6,
    title: 'Dynamic Programming basics',
    status: 'locked',
    tasks: [
      { text: 'Understand memoisation vs tabulation', done: false },
      { text: 'Solve fibonacci, climbing stairs, coin change', done: false },
      { text: 'Learn longest common subsequence', done: false },
      { text: 'Solve 8 DP problems', done: false },
    ],
    tip: 'DP is the hardest topic but also the most rewarding once mastered.',
  },
]

const statusConfig = {
  completed: { color: 'bg-green-500', light: 'bg-green-50 border-green-100', label: 'Completed', icon: CheckCircle, iconColor: 'text-green-500' },
  current:   { color: 'bg-blue-600',  light: 'bg-blue-50 border-blue-100',   label: 'In progress', icon: Zap,          iconColor: 'text-blue-600'  },
  upcoming:  { color: 'bg-amber-400', light: 'bg-amber-50 border-amber-100', label: 'Upcoming',    icon: Target,       iconColor: 'text-amber-500' },
  locked:    { color: 'bg-gray-300',  light: 'bg-gray-50 border-gray-100',   label: 'Locked',      icon: Lock,         iconColor: 'text-gray-400'  },
}

const stats = [
  { label: 'Weeks completed', value: '2/6', color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Tasks finished', value: '8/24', color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Current streak', value: '5 days', color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Est. completion', value: '4 weeks', color: 'text-amber-600', bg: 'bg-amber-50' },
]

export default function CareerRoadmap() {
  const [expanded, setExpanded] = useState(3)

  const toggle = (week) => setExpanded(expanded === week ? null : week)

  return (
    <div className="p-8 max-w-3xl">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Career roadmap</h2>
        <p className="text-gray-500 text-sm mt-1">
          Your personalised week by week placement preparation plan
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {stats.map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <p className={`text-xl font-semibold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-900">Overall progress</p>
          <p className="text-sm font-semibold text-blue-600">33%</p>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
          <div className="bg-blue-600 h-2 rounded-full transition-all duration-700" style={{ width: '33%' }} />
        </div>
        <div className="flex gap-3">
          {roadmap.map(({ week, status }) => (
            <div
              key={week}
              className={`flex-1 h-2 rounded-full ${statusConfig[status].color}`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {roadmap.map(({ week }) => (
            <p key={week} className="text-xs text-gray-400 flex-1 text-center">W{week}</p>
          ))}
        </div>
      </div>

      {/* Roadmap weeks */}
      <div className="space-y-3">
        {roadmap.map(({ week, title, status, tasks, tip }) => {
          const cfg = statusConfig[status]
          const Icon = cfg.icon
          const isExpanded = expanded === week
          const isLocked = status === 'locked'
          const completedTasks = tasks.filter(t => t.done).length

          return (
            <div
              key={week}
              className={`bg-white rounded-2xl border transition-all ${cfg.light} ${isLocked ? 'opacity-60' : ''}`}
            >
              {/* Week header */}
              <button
                onClick={() => !isLocked && toggle(week)}
                disabled={isLocked}
                className="w-full flex items-center gap-4 p-5 text-left"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  status === 'completed' ? 'bg-green-100' :
                  status === 'current' ? 'bg-blue-100' :
                  status === 'upcoming' ? 'bg-amber-100' : 'bg-gray-100'
                }`}>
                  <Icon size={18} className={cfg.iconColor} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-gray-900">Week {week} — {title}</p>
                    {status === 'current' && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Current</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {completedTasks}/{tasks.length} tasks complete
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${cfg.color}`}
                      style={{ width: `${(completedTasks / tasks.length) * 100}%` }}
                    />
                  </div>
                  {!isLocked && (
                    isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && !isLocked && (
                <div className="px-5 pb-5">
                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 mb-4">
                    <p className="text-xs text-amber-700">
                      <span className="font-semibold">Tip:</span> {tip}
                    </p>
                  </div>
                  <div className="space-y-2.5">
                    {tasks.map((task, i) => (
                      <div key={i} className="flex items-start gap-3">
                        {task.done
                          ? <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                          : <Circle size={18} className="text-gray-300 flex-shrink-0 mt-0.5" />
                        }
                        <p className={`text-sm ${task.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                          {task.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* AI note */}
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={16} className="text-blue-600" />
          <p className="text-sm font-medium text-blue-900">AI generated roadmap</p>
        </div>
        <p className="text-sm text-blue-700">
          This roadmap was created based on your current skills, target companies, and the time remaining before placement season. It updates automatically as you progress.
        </p>
      </div>
    </div>
  )
}