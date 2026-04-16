# Quick Patch Templates - Remaining Bugs

These are ready-to-apply patches for the remaining 4 bugs. Copy-paste the code into the respective files.

---

## BUG #12 & #15: file-service - Enhanced Auth & Error Handling

**File**: `backend/file-service/src/index.js`

### Replace the entire file with:

```javascript
const path = require('path')
const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const multer = require('multer')

const app = express()
app.use(cors())

const PORT = Number(process.env.PORT || 8092)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const uploadDir = path.join(__dirname, '..', 'uploads')

// Logging helper
function logStructured(level, message, metadata = {}) {
  const log = {
    timestamp: new Date().toISOString(),
    level,
    message,
    service: 'file-service',
    ...metadata,
  }
  console.log(JSON.stringify(log))
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

function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Missing token',
        requestId: req.requestId,
      })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded?.userId && !decoded?.sub) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token: missing userId',
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
      requestId: req.headers['x-request-id'],
    })
  }
}

// Middleware to attach requestId
app.use((req, res, next) => {
  req.requestId = req.headers['x-request-id'] || `file-${Date.now()}`
  next()
})

app.use('/uploads', express.static(uploadDir))

app.get('/api/files/health', (_req, res) => {
  res.json({ success: true, message: 'File service running' })
})

app.post('/api/files/upload-resume', auth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
        requestId: req.requestId,
      })
    }

    // Validate user
    const userId = req.user?.userId || req.user?.sub
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      logStructured('error', 'Invalid user context', { user: req.user })
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication context',
        requestId: req.requestId,
      })
    }

    // Validate file
    if (!req.file.filename || typeof req.file.filename !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid file upload',
        requestId: req.requestId,
      })
    }

    const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${encodeURIComponent(req.file.filename)}`

    logStructured('info', 'Resume uploaded', {
      userId,
      filename: req.file.filename,
      size: req.file.size,
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
      requestId: req.requestId,
    })
  } catch (err) {
    logStructured('error', 'Upload error', { error: err.message })
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      requestId: req.requestId,
    })
  }
})

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    requestId: _req.requestId,
  })
})

// Global error handler (last)
app.use((err, req, res, _next) => {
  logStructured('error', 'Unhandled error', {
    error: err.message,
    stack: err.stack,
  })

  const statusCode = err.status || err.statusCode || 500

  res.status(statusCode).json({
    success: false,
    message: err.message || 'An error occurred',
    error: process.env.NODE_ENV === 'development' ? { message: err.message, code: err.code } : undefined,
    requestId: req.requestId || 'unknown',
  })
})

app.listen(PORT, () => {
  logStructured('info', 'File service started', { port: PORT })
})
```

---

## BUG #13: drive-service - Auth Error Consistency

**File**: `backend/drive-service/src/index.js`

### Replace auth function with:

```javascript
function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: missing token',
        requestId: req.headers['x-request-id'],
      })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded?.userId && !decoded?.sub) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: invalid token',
        requestId: req.headers['x-request-id'],
      })
    }

    req.user = decoded
    req.user.userId = decoded.sub || decoded.userId
    req.token = token
    req.requestId = req.headers['x-request-id'] || `drive-${Date.now()}`
    
    return next()
  } catch (err) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'warn',
      message: 'Auth failed',
      service: 'drive-service',
      error: err.message,
    }))
    
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: invalid token',
      error: { code: 'AUTH_FAILED' },
      requestId: req.headers['x-request-id'],
    })
  }
}
```

### Also wrap both service calls with try-catch and error handlers:

```javascript
app.get('/api/drives', auth, async (req, res) => {
  try {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Fetching drives',
      service: 'drive-service',
      userId: req.user.userId,
    }))

    const response = await axios.get(`${PLACEMENT_SERVICE_URL}/api/placement/drives`, {
      headers: {
        Authorization: `Bearer ${req.token}`,
        'x-request-id': req.requestId,
      },
      timeout: 5000,
    })
    
    const drives = response?.data?.data || []
    res.json({
      success: true,
      data: drives.map((d) => ({
        ...d,
        driveId: d.driveId || d.id || d.jobId,
      })),
      requestId: req.requestId,
    })
  } catch (err) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      message: 'Failed to fetch drives',
      service: 'drive-service',
      userId: req.user.userId,
      error: err.message,
    }))
    
    res.status(502).json({
      success: false,
      message: 'Unable to fetch drives',
      error: { code: 'UPSTREAM_ERROR' },
      requestId: req.requestId,
    })
  }
})

app.post('/api/drives/:driveId/apply', auth, async (req, res) => {
  try {
    const { driveId } = req.params
    
    if (!driveId || typeof driveId !== 'string' || driveId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Invalid driveId',
        error: { code: 'INVALID_DRIVE_ID' },
        requestId: req.requestId,
      })
    }

    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Applying to drive',
      service: 'drive-service',
      userId: req.user.userId,
      driveId,
    }))

    const response = await axios.post(
      `${PLACEMENT_SERVICE_URL}/api/placement/apply/${driveId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${req.token}`,
          'x-request-id': req.requestId,
        },
        timeout: 5000,
      }
    )
    
    res.json({
      ...response.data,
      requestId: req.requestId,
    })
  } catch (error) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      message: 'Apply to drive failed',
      service: 'drive-service',
      userId: req.user.userId,
      error: error.message,
    }))
    
    const status = error?.response?.status || 502
    const message = error?.response?.data?.message || 'Unable to apply to drive'
    
    res.status(status).json({
      success: false,
      message,
      error: { code: 'APPLY_ERROR' },
      requestId: req.requestId,
    })
  }
})
```

---

## BUG #14: pdf-service - Response Consistency

**File**: `backend/pdf-service/src/index.js`

### Replace the axios call and error handling section with:

```javascript
const axios = require('axios')

// Create axios instance with timeout
const axiosInstance = axios.create({
  timeout: 5000,
  headers: { 'User-Agent': 'pdf-service/1.0' },
})

// ... existing imports and setup ...

// Add middleware for requestId
app.use((req, res, next) => {
  req.requestId = req.headers['x-request-id'] || `pdf-${Date.now()}`
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
        requestId: req.requestId,
      })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    req.user.userId = decoded.sub || decoded.userId
    req.token = token
    return next()
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      requestId: req.requestId,
    })
  }
}

app.get('/api/pdf/health', (_req, res) => {
  res.json({ success: true, message: 'PDF service running' })
})

app.post('/api/pdf/profile', auth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.sub

    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Generating profile PDF',
      service: 'pdf-service',
      userId,
    }))

    const profileRes = await axiosInstance.get(`${USER_SERVICE_URL}/api/users/profile`, {
      headers: { Authorization: `Bearer ${req.token}` },
    })
    
    if (!profileRes?.data?.data) {
      return res.status(400).json({
        success: false,
        message: 'Profile data not available',
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
      x: 50,
      y: 790,
      size: 20,
      font: bold,
      color: rgb(0.1, 0.2, 0.5),
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
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: 'Failed to write PDF file',
        service: 'pdf-service',
        error: writeErr.message,
      }))
      
      return res.status(500).json({
        success: false,
        message: 'Failed to generate PDF',
        error: { code: 'PDF_WRITE_ERROR' },
        requestId: req.requestId,
      })
    }

    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'PDF generated successfully',
      service: 'pdf-service',
      userId,
      filename,
    }))

    res.json({
      success: true,
      data: {
        url: `${req.protocol}://${req.get('host')}/pdfs/${filename}`,
        filename,
      },
      requestId: req.requestId,
    })
  } catch (err) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      message: 'PDF generation failed',
      service: 'pdf-service',
      userId: req.user?.userId,
      error: err.message,
    }))

    const statusCode = err.response?.status === 404 ? 404 : 500
    const message = err.response?.status === 404
      ? 'User profile not found'
      : 'Could not generate profile PDF'

    res.status(statusCode).json({
      success: false,
      message,
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
    requestId: _req.requestId,
  })
})

// Global error handler
app.use((err, req, res, _next) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'error',
    message: 'Unhandled error',
    service: 'pdf-service',
    error: err.message,
    stack: err.stack,
  }))

  res.status(500).json({
    success: false,
    message: 'Server error',
    error: { code: 'INTERNAL_ERROR' },
    requestId: req.requestId,
  })
})

app.listen(PORT, () => {
  console.log(`PDF service listening on ${PORT}`)
})
```

---

## Deployment Order

Apply in this sequence:

1. **auth-service** - Already applied ✅
2. **api-gateway** - Already applied ✅  
3. **notification-service** - Already applied ✅
4. **analytics-service** - Already applied ✅
5. **ai-service** - Already applied ✅
6. **file-service** - Use template above (BUG #12, #15)
7. **drive-service** - Use template above (BUG #13)
8. **pdf-service** - Use template above (BUG #14)

---

## Quick Verification

After applying each template:

```bash
# For file-service
cd backend/file-service && npm install && npm test

# For drive-service
cd backend/drive-service && npm install && npm test

# For pdf-service
cd backend/pdf-service && npm install && npm test
```

Test each endpoint with curl:

```bash
# Test authenticated endpoints
curl -H "Authorization: Bearer $JWT_TOKEN" http://localhost:8092/api/files/health
curl -H "Authorization: Bearer $JWT_TOKEN" http://localhost:8093/api/drives
curl -H "Authorization: Bearer $JWT_TOKEN" http://localhost:8094/api/pdf/health
```
