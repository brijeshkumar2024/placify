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

const authInstance = createInstance('http://localhost:8081')
const jobInstance = createInstance('http://localhost:8083')

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
}

export default authInstance
