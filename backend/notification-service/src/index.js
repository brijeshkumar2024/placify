const express = require('express')
const cors = require('cors')
const axios = require('axios')
const http = require('node:http')
const { MongoClient } = require('mongodb')
const { WebSocketServer } = require('ws')
const jwt = require('jsonwebtoken')

const app = express()
app.use(cors())
app.use(express.json())

const PORT = Number(process.env.PORT || 8091)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_placement'
const MONGODB_DB = process.env.MONGODB_DB || 'campus_placement'
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const INTERVIEW_SERVICE_URL = process.env.INTERVIEW_SERVICE_URL || 'http://127.0.0.1:8085'

const client = new MongoClient(MONGODB_URI)
const NOTIFICATIONS_COLLECTION = 'notification_feed'
const READS_COLLECTION = 'notification_reads'
const server = http.createServer(app)
const websocketServer = new WebSocketServer({ server, path: '/ws/notifications' })
const clients = new Set()
const MAX_WEBSOCKET_CLIENTS = 10000

const seedNotifications = [
  { id: 'n1', title: 'Profile reminder', message: 'Upload your resume to improve match score.', type: 'info', createdAt: new Date().toISOString(), expiryDate: null },
  { id: 'n2', title: 'Interview tip', message: 'Complete a mock interview this week.', type: 'warning', createdAt: new Date().toISOString(), expiryDate: null },
]

// Structured logging
function logStructured(level, message, metadata = {}) {
  const log = {
    timestamp: new Date().toISOString(),
    level,
    message,
    service: 'notification-service',
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

// Trust gateway: extract user from headers
function authMiddleware(req, res, next) {
  const userId = req.headers['x-user-id']
  const requestId = req.headers['x-request-id']

  if (!userId) {
    return res.status(401).json(errorResponse('Unauthorized: missing user context', 'MISSING_USER_CONTEXT', null, requestId))
  }

  req.user = { userId }
  req.requestId = requestId
  next()
}

// Propagate request context
function getDownstreamHeaders(req) {
  return {
    'x-user-id': req.user?.userId || '',
    'x-user-role': req.headers['x-user-role'] || 'STUDENT',
    'x-request-id': req.requestId || '',
    'x-forwarded-for': req.headers['x-forwarded-for'] || req.ip || 'unknown',
  }
}


async function getCollections() {
  if (!client.topology?.isConnected?.()) {
    await client.connect()
    const db = client.db(MONGODB_DB)
    await db.collection(NOTIFICATIONS_COLLECTION).createIndex({ id: 1 }, { unique: true })
    await db.collection(READS_COLLECTION).createIndex({ userId: 1 }, { unique: true })
  }
  const db = client.db(MONGODB_DB)
  return {
    notifications: db.collection(NOTIFICATIONS_COLLECTION),
    reads: db.collection(READS_COLLECTION),
  }
}

async function ensureSeedNotifications(collection) {
  const count = await collection.countDocuments()
  if (count === 0) {
    await collection.insertMany(seedNotifications)
  }
}

async function getReadIds(readsCollection, userId) {
  const record = await readsCollection.findOne({ userId })
  return record?.readIds || []
}

function normalizeNotifications(baseList, readIds) {
  return baseList.map((n) => ({ ...n, read: readIds.includes(n.id) }))
}

function broadcast(payload) {
  const message = JSON.stringify(payload)
  let successCount = 0
  let failCount = 0

  for (const clientConnection of clients) {
    if (clientConnection.readyState === 1) {
      try {
        clientConnection.send(message)
        successCount++
      } catch (err) {
        logStructured('warn', 'Broadcast send failed', { error: err.message })
        try {
          clientConnection.close(1011, 'Send error')
        } catch (e) {
          logStructured('debug', 'Client already closed after send error', { error: e.message })
        }
        clients.delete(clientConnection)
        failCount++
      }
    }
  }

  if (failCount > 0) {
    logStructured('warn', 'Broadcast had failures', {
      succeeded: successCount,
      failed: failCount,
      remaining: clients.size,
    })
  }
}

// WebSocket real-time broadcast
websocketServer.on('connection', async (socket, req) => {
  try {
    // SECURITY: Validate WebSocket auth
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

    if (!token) {
      logStructured('warn', 'WebSocket connection without token')
      socket.close(4001, 'Unauthorized: missing token')
      return
    }

    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      logStructured('warn', 'WebSocket auth failed', { error: err.message })
      socket.close(4001, 'Unauthorized: invalid token')
      return
    }

    const userId = decoded.userId
    if (!userId) {
      logStructured('warn', 'WebSocket token missing userId')
      socket.close(4001, 'Unauthorized: invalid token')
      return
    }

    // Check max clients limit
    if (clients.size >= MAX_WEBSOCKET_CLIENTS) {
      logStructured('warn', 'WebSocket max clients exceeded', { current: clients.size })
      socket.close(4029, 'Server at capacity')
      return
    }

    socket.userId = userId
    clients.add(socket)
    logStructured('info', 'WebSocket client connected', {
      userId,
      totalClients: clients.size,
    })

    socket.send(JSON.stringify({ type: 'connected', userId, message: 'Notification stream active' }))

  try {
    const { notifications } = await getCollections()
    await ensureSeedNotifications(notifications)
    const feed = await notifications.find({}).sort({ createdAt: -1 }).toArray()
    socket.send(JSON.stringify({ type: 'snapshot', data: feed }))
  } catch (error) {
    logStructured('error', 'WebSocket snapshot failed', { error: error.message })
    socket.send(JSON.stringify({ type: 'snapshot', data: [] }))
  }

    socket.on('error', (err) => {
      logStructured('error', 'WebSocket error', {
        userId: socket.userId,
        error: err.message,
      })
      try {
        socket.close(1011, 'Internal error')
      } catch (e) {
        logStructured('debug', 'Socket already closed after error', { error: e.message })
      }
      clients.delete(socket)
    })

    socket.on('close', () => {
      clients.delete(socket)
      logStructured('debug', 'WebSocket client disconnected', {
        userId: socket.userId,
        remaining: clients.size,
      })
    })
  } catch (err) {
    logStructured('error', 'WebSocket connection handler error', { error: err.message })
    try {
      socket.close(4000, 'Connection error')
    } catch (e) {
      logStructured('debug', 'Socket already closed on connection error', { error: e.message })
    }
  }
})

// Periodic cleanup of dead WebSocket connections
setInterval(() => {
  let cleaned = 0
  for (const client of clients) {
    if (client.readyState !== 1) { // 1 = OPEN
      clients.delete(client)
      cleaned++
    }
  }

  if (cleaned > 0) {
    logStructured('info', 'Cleaned dead WebSocket connections', {
      cleaned,
      remaining: clients.size,
    })
  }
}, 30000) // Every 30 seconds

// Add global error handler for WebSocket server
websocketServer.on('error', (err) => {
  logStructured('error', 'WebSocket server error', { error: err.message })
})
app.get('/api/notifications/health', (_req, res) => {
  res.json(successResponse('Notification service running'))
})
app.get('/api/notifications', authMiddleware, async (req, res) => {
  try {
    const { notifications, reads } = await getCollections()
    await ensureSeedNotifications(notifications)
    const readIds = await getReadIds(reads, req.user.userId)
    let list = await notifications.find({}).sort({ createdAt: -1 }).toArray()

    // Fetch upstream notifications from interview service
    try {
      const headers = getDownstreamHeaders(req)
      const upstream = await axios.get(`${INTERVIEW_SERVICE_URL}/api/interview/notifications/student`, {
        headers,
        timeout: 5000,
      })
      const external = upstream?.data?.data || []
      const mapped = external.map((n) => ({
        id: `int-${n.id}`,
        title: n.title,
        message: n.message,
        type: n.type || 'info',
        createdAt: n.createdAt,
        expiryDate: n.expiryDate,
      }))
      list = [...mapped, ...list]
    } catch (error) {
      logStructured('warn', 'Failed to fetch upstream notifications', { userId: req.user.userId, error: error.message })
    }

    res.json(successResponse('Notifications retrieved', normalizeNotifications(list, readIds), req.requestId))
  } catch (error) {
    logStructured('error', 'Notifications retrieval failed', { userId: req.user.userId, error: error.message })
    res.status(500).json(errorResponse('Unable to retrieve notifications', 'FETCH_ERROR', null, req.requestId))
  }
})

app.get('/api/notifications/unread-count', authMiddleware, async (req, res) => {
  try {
    const { notifications, reads } = await getCollections()
    await ensureSeedNotifications(notifications)
    const readIds = await getReadIds(reads, req.user.userId)

    let notificationIds = (await notifications.find({}).project({ id: 1 }).toArray()).map((n) => n.id)

    // Include upstream notification IDs
    try {
      const headers = getDownstreamHeaders(req)
      const upstream = await axios.get(`${INTERVIEW_SERVICE_URL}/api/interview/notifications/student`, {
        headers,
        timeout: 5000,
      })
      const external = upstream?.data?.data || []
      notificationIds = [...external.map((n) => `int-${n.id}`), ...notificationIds]
    } catch (error) {
      logStructured('warn', 'Failed to fetch upstream for unread count', { userId: req.user.userId, error: error.message })
    }

    const unread = notificationIds.filter((id) => !readIds.includes(id)).length
    res.json(successResponse('Unread count retrieved', { count: unread }, req.requestId))
  } catch (error) {
    logStructured('error', 'Unread count failed', { userId: req.user.userId, error: error.message })
    res.status(500).json(errorResponse('Unable to get unread count', 'COUNT_ERROR', null, req.requestId))
  }
})

app.patch('/api/notifications/:id/read', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { reads } = await getCollections()
    await reads.updateOne(
      { userId: req.user.userId },
      { $addToSet: { readIds: id }, $set: { updatedAt: new Date() } },
      { upsert: true }
    )
    broadcast({ type: 'notification-read', userId: req.user.userId, id, at: new Date().toISOString() })
    logStructured('info', 'Notification marked as read', { userId: req.user.userId, notificationId: id })
    res.json(successResponse('Notification marked as read', null, req.requestId))
  } catch (error) {
    logStructured('error', 'Mark read failed', { userId: req.user.userId, error: error.message })
    res.status(500).json(errorResponse('Unable to mark notification as read', 'MARK_READ_ERROR', null, req.requestId))
  }
})

app.patch('/api/notifications/read-all', authMiddleware, async (req, res) => {
  try {
    const { notifications, reads } = await getCollections()
    await ensureSeedNotifications(notifications)
    let ids = (await notifications.find({}).project({ id: 1 }).toArray()).map((n) => n.id)

    // Include upstream notification IDs
    try {
      const headers = getDownstreamHeaders(req)
      const upstream = await axios.get(`${INTERVIEW_SERVICE_URL}/api/interview/notifications/student`, {
        headers,
        timeout: 5000,
      })
      const externalIds = (upstream?.data?.data || []).map((n) => `int-${n.id}`)
      ids = [...ids, ...externalIds]
    } catch (error) {
      logStructured('warn', 'Failed to fetch upstream for read-all', { userId: req.user.userId, error: error.message })
    }

    await reads.updateOne(
      { userId: req.user.userId },
      { $set: { readIds: ids, updatedAt: new Date() } },
      { upsert: true }
    )
    broadcast({ type: 'notification-read-all', userId: req.user.userId, at: new Date().toISOString() })
    logStructured('info', 'All notifications marked as read', { userId: req.user.userId })
    res.json(successResponse('All notifications marked as read', null, req.requestId))
  } catch (error) {
    logStructured('error', 'Mark read-all failed', { userId: req.user.userId, error: error.message })
    res.status(500).json(errorResponse('Unable to mark all as read', 'READ_ALL_ERROR', null, req.requestId))
  }
})

// Keep fallback middleware after all routes
app.use((_req, res) => {
  res.status(404).json(errorResponse('Not found', 'NOT_FOUND'))
})

app.use((err, req, res, _next) => {
  logStructured('error', 'Unhandled error', { error: err.message })
  res.status(500).json(errorResponse('Server error', 'INTERNAL_ERROR', null, req.requestId))
})

client.connect()
  .then(() => {
    const db = client.db(MONGODB_DB)
    return Promise.all([
      db.collection(NOTIFICATIONS_COLLECTION).createIndex({ id: 1 }, { unique: true }),
      db.collection(READS_COLLECTION).createIndex({ userId: 1 }, { unique: true }),
    ])
  })
  .then(async () => {
    const { notifications } = await getCollections()
    await ensureSeedNotifications(notifications)
    server.listen(PORT, () => {
      logStructured('info', 'Notification service started', { port: PORT })
    })
  })
  .catch((error) => {
    logStructured('error', 'Failed to initialize notification MongoDB', { error: error.message })
    process.exit(1)
  })
