import axios from 'axios'

const authApi_instance = axios.create({
  baseURL: 'http://localhost:8081',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

const userApi_instance = axios.create({
  baseURL: 'http://localhost:8082',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

const addAuthInterceptor = (instance) => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('placify_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })
  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        localStorage.removeItem('placify_token')
        window.location.href = '/login'
      }
      return Promise.reject(err)
    }
  )
}

addAuthInterceptor(authApi_instance)
addAuthInterceptor(userApi_instance)

export const authApi = {
  checkEmail: (email) => authApi_instance.post('/api/auth/check-email', { email }),
  verifyOtp: (email, otp) => authApi_instance.post('/api/auth/verify-otp', { email, otp }),
  register: (data) => authApi_instance.post('/api/auth/register', data),
  login: (email, password) => authApi_instance.post('/api/auth/login', { email, password }),
}

export const userApi = {
  getProfile: () => userApi_instance.get('/api/users/profile'),
  updateProfile: (data) => userApi_instance.put('/api/users/profile', data),
}

export default authApi_instance
