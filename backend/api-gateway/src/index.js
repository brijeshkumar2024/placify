const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const jwt = require('jsonwebtoken')
const { createProxyMiddleware } = require('http-proxy-middleware')
const crypto = require('node:crypto')

const app = express()

const PORT = Number(process.env.PORT || 8080)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000)
const RATE_LIMIT_MAX_GLOBAL = Number(process.env.RATE_LIMIT_MAX_GLOBAL || 240) // per IP per window
const RATE_LIMIT_MAX_USER = Number(process.env.RATE_LIMIT_MAX_USER || 120) // per user per window

const requestBuckets = new Map() // IP-based buckets
const userBuckets = new Map()   // User-based buckets

// Cleanup old rate limit buckets every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now()
  const threshold = RATE_LIMIT_WINDOW_MS * 3
  let ipCleaned = 0
  let userCleaned = 0

  for (const [key, bucket] of requestBuckets.entries()) {
    if (now - bucket.windowStart > threshold) {
      requestBuckets.delete(key)
      ipCleaned++
    }
  }

  for (const [key, bucket] of userBuckets.entries()) {
    if (now - bucket.windowStart > threshold) {
      userBuckets.delete(key)
      userCleaned++
    }
  }

  if (ipCleaned > 0 || userCleaned > 0) {
    logStructured('debug', 'Rate limit bucket cleanup', {
      ipBucketsRemoved: ipCleaned,
      userBucketsRemoved: userCleaned,
      ipBucketsRemaining: requestBuckets.size,
      userBucketsRemaining: userBuckets.size,
    })
  }
}, 5 * 60 * 1000) // Every 5 minutes

const targets = {
  '/api/auth': process.env.AUTH_SERVICE_URL || 'http://127.0.0.1:8081',
  '/api/users': process.env.USER_SERVICE_URL || 'http://127.0.0.1:8082',
  '/api/jobs': process.env.JOB_SERVICE_URL || 'http://127.0.0.1:8083',
  '/api/recruiter': process.env.JOB_SERVICE_URL || 'http://127.0.0.1:8083',
  '/api/applications': process.env.JOB_SERVICE_URL || 'http://127.0.0.1:8083',
  '/api/interviews': process.env.JOB_SERVICE_URL || 'http://127.0.0.1:8083',
  '/api/tpo': process.env.JOB_SERVICE_URL || 'http://127.0.0.1:8083',
  '/api/placement': process.env.PLACEMENT_SERVICE_URL || 'http://127.0.0.1:8084',
  '/api/interview': process.env.INTERVIEW_SERVICE_URL || 'http://127.0.0.1:8085',
  '/api/ai': process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000',
  '/api/analytics': process.env.ANALYTICS_SERVICE_URL || 'http://127.0.0.1:8090',
  '/api/notifications': process.env.NOTIFICATION_SERVICE_URL || 'http://127.0.0.1:8091',
  '/api/files': process.env.FILE_SERVICE_URL || 'http://127.0.0.1:8092',
  '/api/drives': process.env.DRIVE_SERVICE_URL || 'http://127.0.0.1:8093',
  '/api/pdf': process.env.PDF_SERVICE_URL || 'http://127.0.0.1:8094',
  '/uploads': process.env.FILE_SERVICE_URL || 'http://127.0.0.1:8092',
  '/pdfs': process.env.PDF_SERVICE_URL || 'http://127.0.0.1:8094',
}

const versionedTargets = Object.fromEntries(
  Object.entries(targets).map(([path, target]) => [`/api/v1${path.slice(4)}`, target])
)

// Structured logging helper
function logStructured(level, message, metadata = {}) {
  const log = {
    timestamp: new Date().toISOString(),
    level,
    message,
    service: 'api-gateway',
    ...metadata,
  }
  console.log(JSON.stringify(log))
}

app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(cors())
app.use(express.json())

// Extract real client IP, accounting for reverse proxies
function extractClientIP(req) {
  // Check X-Forwarded-For first (set by reverse proxies like nginx, load balancers)
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded && typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim()
  }

  // Check other proxy headers
  if (req.headers['cf-connecting-ip']) {
    return req.headers['cf-connecting-ip']
  }

  // Fallback chain
  return req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         req.ip ||
         'unknown'
}

// Request context middleware: trace ID, rate limiting, user extraction
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID()
  const correlationId = req.headers['x-correlation-id'] || requestId
  req.requestId = requestId
  req.correlationId = correlationId
  res.setHeader('x-request-id', requestId)
  res.setHeader('x-correlation-id', correlationId)

  // IP-based rate limiting
  const ip = extractClientIP(req)
  const now = Date.now()
  const ipBucket = requestBuckets.get(ip) || { count: 0, windowStart: now }

  if (now - ipBucket.windowStart > RATE_LIMIT_WINDOW_MS) {
    ipBucket.count = 0
    ipBucket.windowStart = now
  }

  ipBucket.count += 1
  requestBuckets.set(ip, ipBucket)

  if (ipBucket.count > RATE_LIMIT_MAX_GLOBAL) {
    logStructured('warn', 'IP rate limit exceeded', { ip, limit: RATE_LIMIT_MAX_GLOBAL })
    return res.status(429).json({
      success: false,
      message: 'Rate limit exceeded',
      data: null,
      error: { code: 'RATE_LIMIT_EXCEEDED', ip },
      requestId,
    })
  }

  // Record timing
  const startedAt = process.hrtime.bigint()
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000
    logStructured('info', 'Request completed', {
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Number.parseFloat(durationMs.toFixed(3)),
      userId: req.user?.userId || 'anonymous',
    })
  })

  next()
})

const publicPrefixes = ['/api/auth', '/api/ai', '/uploads', '/pdfs', '/health']

// JWT extraction and validation at gateway
function authMiddleware(req, res, next) {
  if (publicPrefixes.some((prefix) => req.path.startsWith(prefix))) {
    return next()
  }

  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: missing token',
      data: null,
      error: { code: 'MISSING_TOKEN' },
      requestId: req.requestId,
    })
  }

  let tokenPayload
  try {
    tokenPayload = jwt.verify(token, JWT_SECRET)
  } catch (err) {
    logStructured('warn', 'Invalid token', { requestId: req.requestId, error: err.message })
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: invalid token',
      data: null,
      error: { code: 'INVALID_TOKEN' },
      requestId: req.requestId,
    })
  }

  // User-based rate limiting
  const userId = tokenPayload.userId
  if (!userId || typeof userId !== 'string' || !userId.trim()) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: invalid token payload',
      data: null,
      error: { code: 'INVALID_TOKEN_PAYLOAD' },
      requestId: req.requestId,
    })
  }
  const userKey = `user:${userId}`
  const now = Date.now()
  const userBucket = userBuckets.get(userKey) || { count: 0, windowStart: now }

  if (now - userBucket.windowStart > RATE_LIMIT_WINDOW_MS) {
    userBucket.count = 0
    userBucket.windowStart = now
  }

  userBucket.count += 1
  userBuckets.set(userKey, userBucket)

  if (userBucket.count > RATE_LIMIT_MAX_USER) {
    logStructured('warn', 'User rate limit exceeded', { userId, limit: RATE_LIMIT_MAX_USER })
    return res.status(429).json({
      success: false,
      message: 'Rate limit exceeded',
      data: null,
      error: { code: 'RATE_LIMIT_EXCEEDED', userId },
      requestId: req.requestId,
    })
  }

  // Attach user to request and set headers for downstream microservices
  req.user = tokenPayload
  req.user.userId = userId
  req.user.role = tokenPayload.role || 'STUDENT'

  // Pass user context to upstream services via headers
  req.headers['x-user-id'] = userId
  req.headers['x-user-role'] = req.user.role
  req.headers['x-user-email'] = tokenPayload.email || ''
  req.headers['x-user-name'] = tokenPayload.fullName || ''
  req.headers['x-forwarded-for'] = extractClientIP(req)

  next()
}

app.use(authMiddleware)

Object.entries({ ...targets, ...versionedTargets }).forEach(([path, target]) => {
  app.use(
    path,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      ws: true,
      logLevel: 'silent',
      // Preserve request ID in proxy headers
      onProxyReq: (proxyReq, req) => {
        proxyReq.setHeader('x-request-id', req.requestId)
        proxyReq.setHeader('x-correlation-id', req.correlationId)
      },
      onError: (err, req, res) => {
        logStructured('error', 'Upstream error', {
          path: req.path,
          target,
          error: err.message,
          requestId: req.requestId,
        })
        res.status(502).json({
          success: false,
          message: 'Service unavailable',
          data: null,
          error: { code: 'SERVICE_UNAVAILABLE', service: path },
          requestId: req.requestId,
        })
      },
    })
  )
})

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API gateway running',
    data: {
      port: PORT,
      timestamp: new Date().toISOString(),
      services: Object.keys(targets),
    },
    error: null,
    requestId: req.requestId,
  })
})

// Global error handler
app.use((err, req, res) => {
  logStructured('error', 'Unhandled error', { error: err.message })
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    data: null,
    error: { code: 'INTERNAL_ERROR' },
    requestId: req.requestId || 'unknown',
  })
})

app.listen(PORT, () => {
  logStructured('info', 'API gateway started', { port: PORT })
})
