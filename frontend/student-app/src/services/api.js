import axios from 'axios'
import useAuthStore, { TOKEN_KEY } from '../store/authStore'
import { isAuthEndpoint, isTokenExpired } from '../utils/auth'
import { createApiInstance } from './client'

let handlingUnauthorized = false

const redirectToLogin = () => {
  if (globalThis.window && globalThis.location.pathname !== '/login') {
    globalThis.location.replace('/login')
  }
}

const handleUnauthorized = () => {
  if (handlingUnauthorized) return
  handlingUnauthorized = true
  useAuthStore.getState().logout()
  redirectToLogin()
  globalThis.setTimeout(() => { handlingUnauthorized = false }, 0)
}

const createInstance = (baseURL) => createApiInstance({
  baseURL,
  timeout: 30000,
  getToken: () => sessionStorage.getItem(TOKEN_KEY),
  onBeforeRequest: (_config, token) => {
    if (token && isTokenExpired(token)) {
      handleUnauthorized()
      throw new axios.CanceledError('Session expired')
    }
  },
  onUnauthorized: (err) => {
    const hasSession = Boolean(sessionStorage.getItem(TOKEN_KEY))
    const requestUrl = err?.config?.url || ''
    if (hasSession && !isAuthEndpoint(requestUrl)) {
      handleUnauthorized()
    }
  },
})

const apiRoot = import.meta.env.VITE_API_URL || 'http://localhost'
const gatewayBase = import.meta.env.VITE_API_GATEWAY_URL || `${apiRoot}:8080`
const authInstance     = createInstance(import.meta.env.VITE_AUTH_API_URL         || gatewayBase)
const userInstance     = createInstance(import.meta.env.VITE_USER_API_URL         || gatewayBase)
const jobInstance      = createInstance(import.meta.env.VITE_JOB_API_URL          || gatewayBase)
const placementInstance= createInstance(import.meta.env.VITE_PLACEMENT_API_URL    || gatewayBase)
const interviewInstance= createInstance(import.meta.env.VITE_INTERVIEW_API_URL    || gatewayBase)
const analyticsInstance= createInstance(import.meta.env.VITE_ANALYTICS_API_URL    || gatewayBase)
const fileInstance     = createInstance(import.meta.env.VITE_FILE_API_URL         || gatewayBase)
const pdfInstance      = createInstance(import.meta.env.VITE_PDF_API_URL          || gatewayBase)
const aiInstance       = createInstance(import.meta.env.VITE_AI_API_URL           || gatewayBase)

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const authApi = {
  checkEmail:    (email)               => authInstance.post('/api/auth/check-email',   { email }),
  verifyOtp:     (email, otp)          => authInstance.post('/api/auth/verify-otp',    { email, otp }),
  register:      (data)                => authInstance.post('/api/auth/register',       data),
  login:         (data)                => authInstance.post('/api/auth/login',          data),
  forgotPassword:(email)               => authInstance.post('/api/auth/forgot-password',{ email }),
  resetPassword: (token, newPassword)  => authInstance.post('/api/auth/reset-password',{ token, newPassword }),
}

// ── USER ──────────────────────────────────────────────────────────────────────
export const userApi = {
  getProfile:    ()     => userInstance.get('/api/users/profile'),
  updateProfile: (data) => userInstance.put('/api/users/profile', data),
}

// ── JOBS ──────────────────────────────────────────────────────────────────────
export const jobApi = {
  getAllJobs:        ()      => jobInstance.get('/api/jobs'),
  getJob:           (id)    => jobInstance.get(`/api/jobs/${id}`),
  applyToJob:       (jobId) => jobInstance.post(`/api/jobs/${jobId}/apply`),
  getMyApplications:()      => jobInstance.get('/api/jobs/my-applications'),
}

// ── PLACEMENT ─────────────────────────────────────────────────────────────────
export const placementApi = {
  applyToJob:       (jobId, data = {}) => placementInstance.post(`/api/placement/apply/${jobId}`, data),
  getMyApplications:()                 => placementInstance.get('/api/placement/my-applications'),
  getApplicants:    (jobId)            => placementInstance.get(`/api/placement/jobs/${jobId}/applicants`),
  updateStatus:     (id, data)         => placementInstance.put(`/api/placement/applications/${id}/status`, data),
  getStats:         ()                 => placementInstance.get('/api/placement/stats'),
  getDrives:        ()                 => placementInstance.get('/api/placement/drives'),
}

// ── DRIVE (alias for placement drives — same service) ─────────────────────────
export const driveApi = {
  list:  ()       => placementInstance.get('/api/placement/drives'),
  apply: (driveId)=> placementInstance.post(`/api/placement/apply/${driveId}`, {}),
}

// ── INTERVIEW ─────────────────────────────────────────────────────────────────
export const interviewApi = {
  start:        (domain, difficulty, totalQuestions = 5) =>
    interviewInstance.post('/api/interview/start', { domain, difficulty, totalQuestions }),
  submitAnswer: (sessionId, answer) =>
    interviewInstance.post('/api/interview/answer', { sessionId, answer }),
  getReport:    (sessionId) =>
    interviewInstance.get(`/api/interview/report/${sessionId}`),
  getHistory:   ()          =>
    interviewInstance.get('/api/interview/history'),
  abandon:      (sessionId) =>
    interviewInstance.delete(`/api/interview/abandon/${sessionId}`),
}

// ── NOTIFICATIONS (backend has no per-user read tracking; use localStorage) ───
const NOTIF_READ_KEY = 'placify_read_notif_ids'
const _getReadIds = () => new Set(JSON.parse(localStorage.getItem(NOTIF_READ_KEY) || '[]'))
const _saveReadIds = (set) => localStorage.setItem(NOTIF_READ_KEY, JSON.stringify([...set]))

export const notificationApi = {
  list: () =>
    interviewInstance.get('/api/interview/notifications/student').then((res) => {
      const readIds = _getReadIds()
      const raw = res.data?.data || []
      const data = raw.map((n) => ({ ...n, read: readIds.has(n.id) }))
      return { ...res, data: { ...res.data, data } }
    }),

  unreadCount: () =>
    interviewInstance.get('/api/interview/notifications/student')
      .then((res) => {
        const readIds = _getReadIds()
        const raw = res.data?.data || []
        const count = raw.filter((n) => !readIds.has(n.id)).length
        return { data: { data: { count } } }
      })
      .catch(() => ({ data: { data: { count: 0 } } })),

  markRead: (id) => {
    const ids = _getReadIds()
    ids.add(id)
    _saveReadIds(ids)
    return Promise.resolve({ data: { success: true } })
  },

  markAllRead: (ids = []) => {
    const existing = _getReadIds()
    ids.forEach((id) => existing.add(id))
    _saveReadIds(existing)
    return Promise.resolve({ data: { success: true } })
  },
}

// ── ANALYTICS ─────────────────────────────────────────────────────────────────
export const analyticsApi = {
  getRoadmap:         ()                  => analyticsInstance.get('/api/analytics/roadmap'),
  updateRoadmapTask:  (taskId, completed) => analyticsInstance.patch(`/api/analytics/roadmap/tasks/${taskId}`, { completed }),
  getWeaknessAnalysis:()                  => analyticsInstance.get('/api/analytics/weakness-analysis'),
  getProgressSummary: ()                  => analyticsInstance.get('/api/analytics/progress-summary'),
}

// ── FILE UPLOAD ───────────────────────────────────────────────────────────────
export const fileApi = {
  uploadResume: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return fileInstance.post('/api/files/upload-resume', formData)
  },
}

// ── PDF ───────────────────────────────────────────────────────────────────────
export const pdfApi = {
  createProfilePdf: () => pdfInstance.post('/api/pdf/profile'),
}

// ── AI ────────────────────────────────────────────────────────────────────────
export const aiApi = {
  chat: (message, history = [], context = null) =>
    aiInstance.post('/api/ai/chat', { message, history, context }),
  parseResume: (resume_text, target_role = null, job_description = null) =>
    aiInstance.post('/api/ai/resume/parse', { resume_text, target_role, job_description }),
  recommendJobs: (payload) =>
    aiInstance.post('/api/ai/recommendations', payload),
}

export default authInstance
