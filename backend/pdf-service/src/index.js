const fs = require('node:fs')
const path = require('node:path')
const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const axios = require('axios')
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib')

const app = express()
app.use(cors())
app.use(express.json())

const PORT = Number(process.env.PORT || 8094)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://127.0.0.1:8082'
const pdfDir = path.join(__dirname, '..', 'pdfs')

function logStructured(level, message, metadata = {}) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    service: 'pdf-service',
    ...metadata,
  }))
}

// Attach requestId to every request
app.use((req, _res, next) => {
  req.requestId = req.headers['x-request-id'] || `pdf-${Date.now()}`
  next()
})

app.use('/pdfs', express.static(pdfDir))

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
        message: 'Invalid token',
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

app.get('/api/pdf/health', (_req, res) => {
  res.json({ success: true, message: 'PDF service running', data: null, error: null, requestId: _req.requestId })
})

app.post('/api/pdf/profile', auth, async (req, res) => {
  const userId = req.user?.userId

  try {
    logStructured('info', 'Generating profile PDF', { userId, requestId: req.requestId })

    const profileRes = await axios.get(`${USER_SERVICE_URL}/api/users/profile`, {
      headers: {
        Authorization: `Bearer ${req.token}`,
        'x-request-id': req.requestId,
      },
      timeout: 5000,
    })

    if (!profileRes?.data?.data) {
      return res.status(400).json({
        success: false,
        message: 'Profile data not available',
        data: null,
        error: { code: 'NO_PROFILE_DATA' },
        requestId: req.requestId,
      })
    }

    const profile = profileRes.data.data

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842])
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    page.drawText('Placify Student Profile Summary', {
      x: 50, y: 790, size: 20, font: bold, color: rgb(0.1, 0.2, 0.5),
    })

    const lines = [
      `Name: ${profile.fullName || '-'}`,
      `Email: ${profile.email || '-'}`,
      `Branch: ${profile.branch || '-'}`,
      `CGPA: ${profile.cgpa || '-'}`,
      `Graduation Year: ${profile.graduationYear || '-'}`,
      `Completion Score: ${profile.completionScore || 0}%`,
      `Skills: ${(profile.skills || []).join(', ') || '-'}`,
      `LinkedIn: ${profile.linkedinUrl || '-'}`,
      `GitHub: ${profile.githubUrl || '-'}`,
      `Resume URL: ${profile.resumeUrl || '-'}`,
    ]

    let y = 750
    lines.forEach((line) => {
      page.drawText(line, { x: 50, y, size: 11, font, color: rgb(0.1, 0.1, 0.1) })
      y -= 24
    })

    const bytes = await pdfDoc.save()
    const filename = `profile-${Date.now()}.pdf`
    const filePath = path.join(pdfDir, filename)

    try {
      fs.writeFileSync(filePath, bytes)
    } catch (writeErr) {
      logStructured('error', 'Failed to write PDF file', {
        error: writeErr.message, userId, requestId: req.requestId,
      })
      return res.status(500).json({
        success: false,
        message: 'Failed to generate PDF',
        data: null,
        error: { code: 'PDF_WRITE_ERROR' },
        requestId: req.requestId,
      })
    }

    logStructured('info', 'PDF generated successfully', {
      userId, filename, requestId: req.requestId,
    })

    return res.json({
      success: true,
      message: 'Profile PDF generated',
      data: {
        url: `${req.protocol}://${req.get('host')}/pdfs/${filename}`,
        filename,
      },
      error: null,
      requestId: req.requestId,
    })
  } catch (err) {
    logStructured('error', 'PDF generation failed', {
      userId, error: err.message, requestId: req.requestId,
    })

    const statusCode = err.response?.status === 404 ? 404 : 500
    const message = err.response?.status === 404
      ? 'User profile not found'
      : 'Could not generate profile PDF'

    return res.status(statusCode).json({
      success: false,
      message,
      data: null,
      error: { code: statusCode === 404 ? 'PROFILE_NOT_FOUND' : 'PDF_ERROR' },
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
    error: err.message, stack: err.stack, requestId: req.requestId,
  })
  res.status(500).json({
    success: false,
    message: 'Server error',
    data: null,
    error: { code: 'INTERNAL_ERROR' },
    requestId: req.requestId,
  })
})

app.listen(PORT, () => {
  logStructured('info', 'PDF service started', { port: PORT })
})
