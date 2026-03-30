import axios from 'axios'

const createInstance = (baseURL) => {
  const instance = axios.create({ baseURL, headers: { 'Content-Type': 'application/json' }, timeout: 10000 })
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('placify_recruiter_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })
  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        localStorage.removeItem('placify_recruiter_token')
        window.location.href = '/login'
      }
      return Promise.reject(err)
    }
  )
  return instance
}

const apiRoot = import.meta.env.VITE_API_URL || 'http://localhost'
const authInstance = createInstance(import.meta.env.VITE_AUTH_API_URL || `${apiRoot}:8081`)
const jobInstance = createInstance(import.meta.env.VITE_JOB_API_URL || `${apiRoot}:8083`)

export const authApi = {
  checkEmail: (email) => authInstance.post('/api/auth/check-email', { email }),
  verifyOtp: (email, otp) => authInstance.post('/api/auth/verify-otp', { email, otp }),
  register: (data) => authInstance.post('/api/auth/register', data),
  login: (email, password) => authInstance.post('/api/auth/login', { email, password }),
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
  scheduleInterview: (payload) => jobInstance.post('/api/recruiter/interview/schedule', payload),
  startQuickInterview: (payload) => jobInstance.post('/api/recruiter/interview/start', payload),
  getRecruiterStats: (recruiterId) => jobInstance.get('/api/recruiter/dashboard/stats', { params: { recruiterId } }),
}

export default authInstance
