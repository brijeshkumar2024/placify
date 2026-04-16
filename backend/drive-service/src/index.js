const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const axios = require('axios')

const app = express()
app.use(cors())
app.use(express.json())

const PORT = Number(process.env.PORT || 8093)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const PLACEMENT_SERVICE_URL = process.env.PLACEMENT_SERVICE_URL || 'http://127.0.0.1:8084'

function successResponse(message, data = null, requestId = null) {
  return {
    success: true,
    message,
    data,
    error: null,
    ...(requestId && { requestId }),
  }
}

function errorResponse(message, code, requestId = null) {
  return {
    success: false,
    message,
    data: null,
    error: { code },
    ...(requestId && { requestId }),
  }
}

function auth(req, res, next) {
  req.requestId = req.headers['x-request-id'] || `drive-${Date.now()}`
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return res.status(401).json(errorResponse('Missing token', 'MISSING_TOKEN', req.requestId))

  try {
    req.user = jwt.verify(token, JWT_SECRET)
    if (!req.user?.userId) {
      return res.status(401).json(errorResponse('Invalid token', 'INVALID_TOKEN', req.requestId))
    }
    req.token = token
    return next()
  } catch {
    return res.status(401).json(errorResponse('Invalid token', 'INVALID_TOKEN', req.requestId))
  }
}

app.get('/api/drives/health', (_req, res) => {
  res.json(successResponse('Drive service running'))
})

app.get('/api/drives', auth, async (req, res) => {
  try {
    const response = await axios.get(`${PLACEMENT_SERVICE_URL}/api/placement/drives`, {
      headers: {
        Authorization: `Bearer ${req.token}`,
        'x-request-id': req.requestId,
      },
      timeout: 5000,
    })
    const drives = response?.data?.data || []
    res.json(successResponse('Drives retrieved', drives.map((d) => ({
        ...d,
        driveId: d.driveId || d.id || d.jobId,
      })), req.requestId))
  } catch (error) {
    const status = error?.response?.status || 502
    const message = error?.response?.data?.message || 'Unable to fetch drives'
    res.status(status).json(errorResponse(message, 'DRIVE_FETCH_ERROR', req.requestId))
  }
})

app.post('/api/drives/:driveId/apply', auth, async (req, res) => {
  try {
    const { driveId } = req.params
    if (!driveId || typeof driveId !== 'string' || !driveId.trim()) {
      return res.status(400).json(errorResponse('Invalid driveId', 'INVALID_DRIVE_ID', req.requestId))
    }
    const response = await axios.post(`${PLACEMENT_SERVICE_URL}/api/placement/apply/${driveId}`, {}, {
      headers: {
        Authorization: `Bearer ${req.token}`,
        'x-request-id': req.requestId,
      },
      timeout: 5000,
    })
    res.json(successResponse('Applied to drive', response?.data?.data ?? response?.data ?? null, req.requestId))
  } catch (error) {
    const status = error?.response?.status || 502
    const message = error?.response?.data?.message || 'Unable to apply to drive'
    res.status(status).json(errorResponse(message, 'DRIVE_APPLY_ERROR', req.requestId))
  }
})

app.use((_req, res) => {
  res.status(404).json(errorResponse('Not found', 'NOT_FOUND', _req.requestId))
})

app.use((err, req, res, _next) => {
  res.status(500).json(errorResponse(err.message || 'Server error', 'INTERNAL_ERROR', req.requestId))
})

app.listen(PORT, () => {
  console.log(`Drive service listening on ${PORT}`)
})
