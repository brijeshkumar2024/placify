import axios from 'axios'
import useAuthStore, { TOKEN_KEY } from '../store/authStore'
import { isAuthEndpoint, isTokenExpired } from '../utils/auth'

let handlingUnauthorized = false

const redirectToLogin = () => {
  if (typeof globalThis.window !== 'undefined' && globalThis.location.pathname !== '/login') {
    globalThis.location.replace('/login')
  }
}

const handleUnauthorized = () => {
  if (handlingUnauthorized) return

  handlingUnauthorized = true
  useAuthStore.getState().logout()
  redirectToLogin()

  globalThis.setTimeout(() => {
    handlingUnauthorized = false
  }, 0)
}

const createInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
  })

  instance.interceptors.request.use(
    (config) => {
      const token = sessionStorage.getItem(TOKEN_KEY)

      if (token) {
        if (isTokenExpired(token)) {
          handleUnauthorized()
          return Promise.reject(new axios.CanceledError('Session expired'))
        }

        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    }
  )

  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      const hasSession = Boolean(sessionStorage.getItem(TOKEN_KEY))
      const requestUrl = err.config?.url || ''

      if (err.response?.status === 401 && hasSession && !isAuthEndpoint(requestUrl)) {
        handleUnauthorized()
      }

      return Promise.reject(err)
    }
  )

  return instance
}

// ✅ Instances (safe fallback and environment override)
const apiRoot = import.meta.env.VITE_API_URL || 'http://localhost'
const authInstance = createInstance(import.meta.env.VITE_AUTH_API_URL || `${apiRoot}:8081`)
const userInstance = createInstance(import.meta.env.VITE_USER_API_URL || `${apiRoot}:8082`)
const jobInstance = createInstance(import.meta.env.VITE_JOB_API_URL || `${apiRoot}:8083`)
const placementInstance = createInstance(import.meta.env.VITE_PLACEMENT_API_URL || `${apiRoot}:8084`)
const interviewInstance = createInstance(import.meta.env.VITE_INTERVIEW_API_URL || `${apiRoot}:8085`)
const notificationInstance = createInstance(import.meta.env.VITE_NOTIFICATION_API_URL || `${apiRoot}:8085`)

// ✅ AUTH
export const authApi = {
  checkEmail: (email) => authInstance.post('/api/auth/check-email', { email }),
  verifyOtp: (email, otp) => authInstance.post('/api/auth/verify-otp', { email, otp }),
  register: (data) => authInstance.post('/api/auth/register', data),
  login: (data) => authInstance.post('/api/auth/login', data),
  forgotPassword: (email) => authInstance.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) =>
    authInstance.post('/api/auth/reset-password', { token, newPassword }),
}

// ✅ USER
export const userApi = {
  getProfile: () => userInstance.get('/api/users/profile'),
  updateProfile: (data) => userInstance.put('/api/users/profile', data),
}

// ✅ JOB (ONLY JOB LISTING NOW)
export const jobApi = {
  getAllJobs: () => jobInstance.get('/api/jobs'),
  getJob: (id) => jobInstance.get(`/api/jobs/${id}`),
  applyToJob: (jobId) => jobInstance.post(`/api/jobs/${jobId}/apply`),
  getMyApplications: () => jobInstance.get('/api/jobs/my-applications'),
}

// ✅ 🚀 PLACEMENT (MAIN SYSTEM NOW)
export const placementApi = {
  applyToJob: (jobId, data) =>
    placementInstance.post(`/api/placement/apply/${jobId}`, data),

  getMyApplications: () =>
    placementInstance.get('/api/placement/my-applications'),

  getApplicants: (jobId) =>
    placementInstance.get(`/api/placement/jobs/${jobId}/applicants`),

  updateStatus: (id, data) =>
    placementInstance.put(`/api/placement/applications/${id}/status`, data),

  getStats: () =>
    placementInstance.get('/api/placement/stats'),

  getDrives: () =>
    placementInstance.get('/api/placement/drives'),
}

// ✅ INTERVIEW (AI-powered)
export const interviewApi = {
  start: (domain, difficulty, totalQuestions = 5) =>
    interviewInstance.post('/api/interview/start', { domain, difficulty, totalQuestions }),
  submitAnswer: (sessionId, answer) =>
    interviewInstance.post('/api/interview/answer', { sessionId, answer }),
  getReport: (sessionId) =>
    interviewInstance.get(`/api/interview/report/${sessionId}`),
  getHistory: () =>
    interviewInstance.get('/api/interview/history'),
  abandon: (sessionId) =>
    interviewInstance.delete(`/api/interview/abandon/${sessionId}`),
}

// ✅ Notifications
export const notificationApi = {
  list: () => notificationInstance.get('/api/interview/notifications/student'),
}

export default authInstance
