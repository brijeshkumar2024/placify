import axios from 'axios'

export function createApiInstance({
  baseURL,
  timeout = 30000,
  getToken,
  onUnauthorized,
  onBeforeRequest,
}) {
  const instance = axios.create({
    baseURL,
    timeout,
    headers: { 'Content-Type': 'application/json' },
  })

  instance.interceptors.request.use((config) => {
    if (!(config.data instanceof FormData)) {
      config.headers = config.headers || {}
      config.headers['Content-Type'] = 'application/json'
    }

    const token = typeof getToken === 'function' ? getToken() : null
    if (typeof onBeforeRequest === 'function') {
      onBeforeRequest(config, token)
    }

    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })

  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err?.response?.status === 401 && typeof onUnauthorized === 'function') {
        onUnauthorized(err)
      }
      return Promise.reject(err)
    }
  )

  return instance
}
