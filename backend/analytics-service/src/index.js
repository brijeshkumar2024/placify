const express = require('express')
const cors = require('cors')
const axios = require('axios')
const { MongoClient } = require('mongodb')

const app = express()
app.use(cors())
app.use(express.json())

const PORT = Number(process.env.PORT || 8090)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_placement'
const MONGODB_DB = process.env.MONGODB_DB || 'campus_placement'

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://127.0.0.1:8082'
const PLACEMENT_SERVICE_URL = process.env.PLACEMENT_SERVICE_URL || 'http://127.0.0.1:8084'
const INTERVIEW_SERVICE_URL = process.env.INTERVIEW_SERVICE_URL || 'http://127.0.0.1:8085'

const client = new MongoClient(MONGODB_URI)
const ROADMAP_COLLECTION = 'analytics_roadmaps'

const defaultRoadmap = [
  {
    week: 1,
    title: 'Foundation - Arrays and Strings',
    tip: 'Build speed with basic problem patterns first.',
    tasks: [
      { id: 'w1-t1', text: 'Solve 10 easy array problems', completed: false, completedAt: null },
      { id: 'w1-t2', text: 'Practice two pointer pattern', completed: false, completedAt: null },
      { id: 'w1-t3', text: 'Revise string methods', completed: false, completedAt: null },
    ],
  },
  {
    week: 2,
    title: 'Linked Lists and Recursion',
    tip: 'Learn iterative and recursive solutions side by side.',
    tasks: [
      { id: 'w2-t1', text: 'Implement linked list operations', completed: false, completedAt: null },
      { id: 'w2-t2', text: 'Solve cycle and reverse list', completed: false, completedAt: null },
      { id: 'w2-t3', text: 'Solve 5 recursion problems', completed: false, completedAt: null },
    ],
  },
  {
    week: 3,
    title: 'Stacks, Queues and Hashing',
    tip: 'Focus on monotonic stack and hash map lookup tricks.',
    tasks: [
      { id: 'w3-t1', text: 'Implement stack and queue', completed: false, completedAt: null },
      { id: 'w3-t2', text: 'Solve next greater element', completed: false, completedAt: null },
      { id: 'w3-t3', text: 'Complete 8 hashing problems', completed: false, completedAt: null },
    ],
  },
]

// Structured logging
function logStructured(level, message, metadata = {}) {
  const log = {
    timestamp: new Date().toISOString(),
    level,
    message,
    service: 'analytics-service',
    ...metadata,
  }
  console.log(JSON.stringify(log))
}

// Response helpers
function successResponse(message, data = null, requestId = null) {
  return {
    success: true,
    message,
    data,
    error: null,
    ...(requestId && { requestId }),
  }
}

function errorResponse(message, code, details = null, requestId = null) {
  return {
    success: false,
    message,
    data: null,
    error: { code, ...(details && { details }) },
    ...(requestId && { requestId }),
  }
}

// Trust gateway: extract user from headers set by API Gateway
function authMiddleware(req, res, next) {
  const userId = req.headers['x-user-id']
  const role = req.headers['x-user-role']
  const requestId = req.headers['x-request-id']

  if (!userId) {
    return res.status(401).json(errorResponse('Unauthorized: missing user context', 'MISSING_USER_CONTEXT', null, requestId))
  }

  req.user = {
    userId,
    role: role || 'STUDENT',
  }
  req.requestId = requestId
  next()
}

function requireRoles(req, allowedRoles) {
  const role = String(req.user?.role || '').toUpperCase()
  return allowedRoles.includes(role)
}

// Propagate request context to downstream calls
function getDownstreamHeaders(req) {
  return {
    'x-user-id': req.user?.userId || '',
    'x-user-role': req.user?.role || 'STUDENT',
    'x-request-id': req.requestId || '',
    'x-forwarded-for': req.headers['x-forwarded-for'] || req.ip || 'unknown',
  }
}

async function getCollection() {
  if (!client.topology?.isConnected?.()) {
    await client.connect()
    await client.db(MONGODB_DB).collection(ROADMAP_COLLECTION).createIndex({ userId: 1 }, { unique: true })
  }
  return client.db(MONGODB_DB).collection(ROADMAP_COLLECTION)
}

async function getUserState(userId) {
  const collection = await getCollection()
  const existing = await collection.findOne({ userId })
  if (existing) {
    return existing
  }

  const created = { userId, roadmap: structuredClone(defaultRoadmap), updatedAt: new Date() }
  await collection.insertOne(created)
  return created
}

app.get('/api/analytics/roadmap', authMiddleware, async (req, res) => {
  try {
    const state = await getUserState(req.user.userId)
    res.json(successResponse('Roadmap retrieved', { weeks: state.roadmap }, req.requestId))
  } catch (error) {
    logStructured('error', 'Roadmap retrieval failed', { userId: req.user.userId, error: error.message })
    res.status(500).json(errorResponse('Unable to retrieve roadmap', 'ROADMAP_FETCH_ERROR', null, req.requestId))
  }
})

app.patch('/api/analytics/roadmap/tasks/:taskId', authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params
    const completed = req.body?.completed

    if (!validateTaskId(taskId)) {
      return res.status(400).json(errorResponse('Invalid taskId', 'INVALID_TASK_ID', null, req.requestId))
    }

    if (typeof completed !== 'boolean') {
      return res.status(400).json(errorResponse('Invalid completed value', 'INVALID_COMPLETED', null, req.requestId))
    }

    const collection = await getCollection()
    const state = await getUserState(req.user.userId)

    let updatedTask = null
    const nextRoadmap = state.roadmap.map((week) => ({
      ...week,
      tasks: week.tasks.map((task) => {
        if (task.id !== taskId) return task
        updatedTask = {
          ...task,
          completed,
          completedAt: completed ? new Date().toISOString() : null,
        }
        return updatedTask
      }),
    }))

    if (!updatedTask) {
      return res.status(404).json(errorResponse('Task not found', 'TASK_NOT_FOUND', null, req.requestId))
    }

    await collection.updateOne(
      { userId: req.user.userId },
      { $set: { roadmap: nextRoadmap, updatedAt: new Date() } },
      { upsert: true }
    )

    return res.json(successResponse('Task updated', updatedTask, req.requestId))
  } catch (error) {
    logStructured('error', 'Task update failed', { userId: req.user.userId, error: error.message })
    res.status(500).json(errorResponse('Unable to update task', 'TASK_UPDATE_ERROR', null, req.requestId))
  }
})

app.get('/api/analytics/weakness-analysis', authMiddleware, async (req, res) => {
  try {
    const headers = getDownstreamHeaders(req)
    const interviewRes = await axios.get(`${INTERVIEW_SERVICE_URL}/api/interview/history`, { headers, timeout: 5000 })
    const sessions = interviewRes?.data?.data || []

    const scores = {}
    sessions.forEach((session) => {
      const topics = session?.finalReport?.topicBreakdown || []
      topics.forEach((topic) => {
        const key = topic.topic || 'General'
        if (!scores[key]) scores[key] = []
        scores[key].push(Number(topic.score || 0))
      })
    })

    const items = Object.entries(scores).map(([subtopic, values]) => {
      const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      return {
        topic: 'Interview',
        subtopic,
        score: avg,
        feedback: avg < 60 ? 'Needs guided practice and revision.' : 'Maintain consistency with timed practice.',
      }
    })

    const fallback = [
      { topic: 'DSA', subtopic: 'Dynamic Programming', score: 48, feedback: 'Revise recurrence and optimize states.' },
      { topic: 'System Design', subtopic: 'Scalability Basics', score: 55, feedback: 'Practice load and bottleneck reasoning.' },
      { topic: 'Core CS', subtopic: 'Database Indexing', score: 72, feedback: 'Good progress. Keep solving query plans.' },
    ]

    res.json(successResponse('Weakness analysis complete', { items: items.length ? items : fallback }, req.requestId))
  } catch (error) {
    logStructured('warn', 'Weakness analysis fallback', { userId: req.user.userId, error: error.message })
    res.json(successResponse('Weakness analysis complete (fallback)', {
      items: [
        { topic: 'DSA', subtopic: 'Dynamic Programming', score: 48, feedback: 'Revise recurrence and optimize states.' },
        { topic: 'System Design', subtopic: 'Scalability Basics', score: 55, feedback: 'Practice load and bottleneck reasoning.' },
      ],
    }, req.requestId))
  }
})

app.get('/api/analytics/progress-summary', authMiddleware, async (req, res) => {
  try {
    const headers = getDownstreamHeaders(req)
    const [profileRes, appsRes, interviewRes] = await Promise.all([
      axios.get(`${USER_SERVICE_URL}/api/users/profile`, { headers, timeout: 5000 }),
      axios.get(`${PLACEMENT_SERVICE_URL}/api/placement/my-applications`, { headers, timeout: 5000 }),
      axios.get(`${INTERVIEW_SERVICE_URL}/api/interview/history`, { headers, timeout: 5000 }),
    ])

    const profile = profileRes?.data?.data || {}
    const apps = appsRes?.data?.data || []
    const interviews = interviewRes?.data?.data || []

    const skillScores = (profile.skills || []).slice(0, 5).map((skill) => {
      const domainHits = interviews.filter((i) => (i.domain || '').toLowerCase().includes(skill.toLowerCase())).length
      const base = Number(profile.completionScore || 0)
      return { skill, score: Math.min(95, Math.max(35, base + domainHits * 8)) }
    })

    const userState = await getUserState(req.user.userId)
    const tasks = userState.roadmap.flatMap((w) => w.tasks)
    const tasksCompleted = tasks.filter((t) => t.completed).length

    res.json(
      successResponse('Progress summary retrieved', {
        tasksCompleted,
        tasksTotal: tasks.length,
        skillScores,
        applications: apps.length,
        interviews: interviews.length,
      }, req.requestId)
    )
  } catch (error) {
    logStructured('error', 'Progress summary failed', { userId: req.user.userId, error: error.message })
    res.status(500).json(errorResponse('Unable to calculate progress summary', 'PROGRESS_CALC_ERROR', null, req.requestId))
  }
})

app.get('/api/analytics/admin/dashboard', authMiddleware, async (req, res) => {
  try {
    if (!requireRoles(req, ['ADMIN', 'TPO'])) {
      return res.status(403).json(errorResponse('Access denied', 'FORBIDDEN', null, req.requestId))
    }

    const headers = getDownstreamHeaders(req)
    const [statsRes, atRiskRes, interviewRes, profileRes] = await Promise.all([
      axios.get(`${PLACEMENT_SERVICE_URL}/api/placement/stats`, { headers, timeout: 5000 }),
      axios.get(`${PLACEMENT_SERVICE_URL}/api/placement/at-risk`, { headers, timeout: 5000 }),
      axios.get(`${INTERVIEW_SERVICE_URL}/api/interview/history`, { headers, timeout: 5000 }),
      axios.get(`${USER_SERVICE_URL}/api/users/profile`, { headers, timeout: 5000 }).catch(() => ({ data: { data: {} } })),
    ])

    const stats = statsRes?.data?.data || {}
    const atRisk = atRiskRes?.data?.data || []
    const history = interviewRes?.data?.data || []
    const profile = profileRes?.data?.data || {}

    const interviewTrend = history.map((session) => ({
      sessionId: session.id,
      domain: session.domain,
      difficulty: session.difficulty,
      overallScore: session?.finalReport?.overallScore || 0,
      completedAt: session.completedAt || session.createdAt || null,
    }))

    logStructured('info', 'Admin dashboard accessed', { userId: req.user.userId })
    res.json(successResponse('Admin dashboard loaded', {
      overview: {
        totalApplications: stats.totalApplications || 0,
        totalDrives: stats.totalDrives || 0,
        placedStudents: stats.placedStudents || 0,
        onHoldStudents: stats.onHoldStudents || 0,
        atRiskStudents: Array.isArray(atRisk) ? atRisk.length : 0,
        recruiterName: profile.fullName || null,
      },
      interviewTrend,
    }, req.requestId))
  } catch (error) {
    logStructured('error', 'Admin dashboard failed', { userId: req.user.userId, error: error.message })
    res.status(500).json(errorResponse('Unable to load admin analytics', 'DASHBOARD_LOAD_ERROR', null, req.requestId))
  }
})

app.get('/api/analytics/interview-trends', authMiddleware, async (req, res) => {
  try {
    const headers = getDownstreamHeaders(req)
    const interviewRes = await axios.get(`${INTERVIEW_SERVICE_URL}/api/interview/history`, { headers, timeout: 5000 })
    const history = interviewRes?.data?.data || []

    const trend = history.reduce((acc, session) => {
      const key = session.domain || 'General'
      if (!acc[key]) {
        acc[key] = { count: 0, totalScore: 0 }
      }
      acc[key].count += 1
      acc[key].totalScore += Number(session?.finalReport?.overallScore || 0)
      return acc
    }, {})

    const items = Object.entries(trend).map(([domain, value]) => ({
      domain,
      sessions: value.count,
      averageScore: value.count ? Math.round(value.totalScore / value.count) : 0,
    }))

    res.json(successResponse('Interview trends retrieved', items, req.requestId))
  } catch (error) {
    logStructured('error', 'Interview trends failed', { userId: req.user.userId, error: error.message })
    res.status(500).json(errorResponse('Unable to load interview trends', 'TRENDS_LOAD_ERROR', null, req.requestId))
  }
})

client.connect()
  .then(async () => {
    await client.db(MONGODB_DB).collection(ROADMAP_COLLECTION).createIndex({ userId: 1 }, { unique: true })
    app.listen(PORT, () => {
      logStructured('info', 'Analytics service started', { port: PORT })
    })
  })
  .catch((error) => {
    logStructured('error', 'Failed to initialize analytics MongoDB', { error: error.message })
    process.exit(1)
  })
