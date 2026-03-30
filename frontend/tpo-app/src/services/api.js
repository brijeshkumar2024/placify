import axios from 'axios'
const createInstance = (baseURL) => {
  const instance = axios.create({ baseURL, headers: { 'Content-Type': 'application/json' }, timeout: 10000 })
  instance.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('placify_tpo_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })
  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        sessionStorage.removeItem('placify_tpo_token')
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
const userInstance = createInstance(import.meta.env.VITE_USER_API_URL || `${apiRoot}:8082`)
const placementInstance = createInstance(import.meta.env.VITE_PLACEMENT_API_URL || `${apiRoot}:8084`)
const notificationInstance = createInstance(import.meta.env.VITE_NOTIFICATION_API_URL || `${apiRoot}:8085`)
export const authApi = {
  checkEmail: (email) => authInstance.post('/api/auth/check-email', { email }),
  verifyOtp: (email, otp) => authInstance.post('/api/auth/verify-otp', { email, otp }),
  register: (data) => authInstance.post('/api/auth/register', data),
  login: (email, password) => authInstance.post('/api/auth/login', { email, password }),
  createRecruiter: (data) => authInstance.post('/api/auth/admin/recruiters', data),
}
export const jobApi = {
  getAllJobs: () => jobInstance.get('/api/jobs'),
  getJob: (id) => jobInstance.get(`/api/jobs/${id}`),
  getAllApplications: (status) => jobInstance.get('/api/tpo/applications', { params: status ? { status } : {} }),
  getCompanyDetails: (name) => jobInstance.get(`/api/tpo/company/${encodeURIComponent(name)}`),
}
export const userApi = {
  getProfile: () => userInstance.get('/api/users/profile'),
}
export const placementApi = {
  getStats: () => placementInstance.get('/api/placement/stats'),
  getAtRisk: () => placementInstance.get('/api/placement/at-risk'),
  getDrives: () => placementInstance.get('/api/placement/drives'),
  createDrive: (data) => placementInstance.post('/api/placement/drives', data),
  getDriveApplicants: (driveId) => placementInstance.get(`/api/placement/drives/${driveId}/applicants`),
  revokeApplication: (id) => placementInstance.delete(`/api/placement/applications/${id}`),
  getStudents: () => placementInstance.get('/api/placement/students'),
  createStudent: (data) => placementInstance.post('/api/placement/students', data),
  updateStudent: (id, data) => placementInstance.patch(`/api/placement/students/${id}`, data),
  deleteStudent: (id) => placementInstance.delete(`/api/placement/students/${id}`),
  importStudents: (formData) => placementInstance.post('/api/placement/students/import/excel', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
}
export const notificationApi = {
  create: (data) => notificationInstance.post('/api/interview/notifications/create', data),
  listForStudents: () => notificationInstance.get('/api/interview/notifications/student'),
  delete: (id) => notificationInstance.delete(`/api/interview/notifications/${id}`),
}
export default authInstance
