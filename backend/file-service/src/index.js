const path = require('node:path')
const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const multer = require('multer')

const app = express()
app.use(cors())

const PORT = Number(process.env.PORT || 8092)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const uploadDir = path.join(__dirname, '..', 'uploads')

function logStructured(level, message, metadata = {}) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    service: 'file-service',
    ...metadata,
  }))
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '.pdf')
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`
    cb(null, safeName)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /pdf|msword|officedocument\.wordprocessingml\.document/i.test(file.mimetype)
    cb(ok ? null : new Error('Only PDF/DOC/DOCX files are allowed'), ok)
  },
})

// Attach requestId to every request
app.use((req, _res, next) => {
  req.requestId = req.headers['x-request-id'] || `file-${Date.now()}`
  next()
})

function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Missing token',
        data: null,
        error: { code: 'MISSING_TOKEN' },
        requestId: req.requestId,
      })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded?.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token: missing userId',
        data: null,
        error: { code: 'INVALID_TOKEN_PAYLOAD' },
        requestId: req.requestId,
      })
    }

    req.user = decoded
    req.token = token
    return next()
  } catch (err) {
    logStructured('warn', 'Auth failed', { error: err.message })
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      data: null,
      error: { code: 'INVALID_TOKEN' },
      requestId: req.requestId,
    })
  }
}

app.use('/uploads', express.static(uploadDir))

app.get('/api/files/health', (_req, res) => {
  res.json({ success: true, message: 'File service running', data: null, error: null, requestId: _req.requestId })
})

app.post('/api/files/upload-resume', auth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
        data: null,
        error: { code: 'NO_FILE' },
        requestId: req.requestId,
      })
    }

    const userId = req.user?.userId
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      logStructured('error', 'Invalid user context in upload', { user: req.user })
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication context',
        data: null,
        error: { code: 'INVALID_AUTH_CONTEXT' },
        requestId: req.requestId,
      })
    }

    if (!req.file.filename || typeof req.file.filename !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid file upload',
        data: null,
        error: { code: 'INVALID_FILE' },
        requestId: req.requestId,
      })
    }

    const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${encodeURIComponent(req.file.filename)}`

    logStructured('info', 'Resume uploaded', {
      userId,
      filename: req.file.filename,
      size: req.file.size,
      requestId: req.requestId,
    })

    return res.json({
      success: true,
      message: 'Resume uploaded',
      data: {
        resumeUrl: publicUrl,
        filename: req.file.filename,
        size: req.file.size,
        uploadedBy: userId,
      },
      error: null,
      requestId: req.requestId,
    })
  } catch (err) {
    logStructured('error', 'Upload error', { error: err.message, requestId: req.requestId })
    return res.status(500).json({
      success: false,
      message: 'Upload failed',
      data: null,
      error: {
        code: 'UPLOAD_FAILED',
        ...(process.env.NODE_ENV === 'development' ? { details: err.message } : {}),
      },
      requestId: req.requestId,
    })
  }
})

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    data: null,
    error: { code: 'NOT_FOUND' },
    requestId: _req.requestId,
  })
})

// Global error handler (4-param signature required by Express)
app.use((err, req, res, _next) => {
  logStructured('error', 'Unhandled error', {
    error: err.message,
    stack: err.stack,
    requestId: req.requestId,
  })
  res.status(err.status || err.statusCode || 500).json({
    success: false,
    message: err.message || 'An error occurred',
    data: null,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' ? { message: err.message } : {}),
    },
    requestId: req.requestId || 'unknown',
  })
})

app.listen(PORT, () => {
  logStructured('info', 'File service started', { port: PORT })
})
