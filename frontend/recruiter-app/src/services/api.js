import { createApiInstance } from './client'

const recruiterTokenKey = 'placify_recruiter_token'
const recruiterUserKey = 'placify_recruiter_user'

const handleUnauthorized = () => {
  sessionStorage.removeItem(recruiterTokenKey)
  sessionStorage.removeItem(recruiterUserKey)
  globalThis.location.href = '/login'
}

const apiRoot = import.meta.env.VITE_API_URL || 'http://localhost'
const gatewayBase = import.meta.env.VITE_API_GATEWAY_URL || `${apiRoot}:8080`
const authInstance = createApiInstance({
  baseURL: import.meta.env.VITE_AUTH_API_URL || gatewayBase,
  timeout: 15000,
  getToken: () => sessionStorage.getItem(recruiterTokenKey),
  onUnauthorized: handleUnauthorized,
})
const jobInstance = createApiInstance({
  baseURL: import.meta.env.VITE_JOB_API_URL || gatewayBase,
  timeout: 20000,
  getToken: () => sessionStorage.getItem(recruiterTokenKey),
  onUnauthorized: handleUnauthorized,
})

export const authApi = {
  checkEmail: (email) => authInstance.post('/api/auth/check-email', { email }),
  verifyOtp: (email, otp) => authInstance.post('/api/auth/verify-otp', { email, otp }),
  register: (data) => authInstance.post('/api/auth/register', data),
  login: (email, password) => authInstance.post('/api/auth/login', { email, password }),
  forgotPassword: (email) => authInstance.post('/api/auth/forgot-password', { email }),
}

export const jobApi = {
  getAllJobs: () => jobInstance.get('/api/jobs'),
  getJob: (id) => jobInstance.get(`/api/jobs/${id}`),
  createJob: (data) => jobInstance.post('/api/jobs', data),
  getApplicants: (jobId) => jobInstance.get(`/api/jobs/${jobId}/applicants`),
  getRecruiterJobs: (recruiterId, status) =>
    jobInstance.get(`/api/recruiter/jobs/${recruiterId}`, { params: { status } }),
  getApplicantsByJob: (jobId) => jobInstance.get(`/api/recruiter/applications/job/${jobId}`),
  getApplicantCounts: (jobId) => jobInstance.get(`/api/recruiter/applications/job/${jobId}/counts`),
  updateApplicationStatus: (payload) => jobInstance.put('/api/recruiter/applications/status', payload),
  startQuickInterview: (payload) => jobInstance.post('/api/recruiter/interview/start', payload),
  getRecruiterStats: (recruiterId) => jobInstance.get('/api/recruiter/dashboard/stats', { params: { recruiterId } }),
  updateRating: (id, rating) => jobInstance.put(`/api/applications/${id}/rating`, { rating }),
  updateNotes: (id, notes) => jobInstance.put(`/api/applications/${id}/notes`, { notes }),
  scheduleInterview: (payload) => jobInstance.post('/api/interviews/schedule', payload),
}

// Notifications — recruiter reads the same broadcast notifications as students
const interviewInstance = createApiInstance({
  baseURL: import.meta.env.VITE_INTERVIEW_API_URL || gatewayBase,
  timeout: 15000,
  getToken: () => sessionStorage.getItem(recruiterTokenKey),
  onUnauthorized: handleUnauthorized,
})
export const notificationApi = {
  list: () => interviewInstance.get('/api/interview/notifications/student'),
}

export default authInstance
