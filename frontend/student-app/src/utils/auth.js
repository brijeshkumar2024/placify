export const AUTH_SYNC_KEY = 'placify_auth_event'

const decodeBase64Url = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = normalized.length % 4
  const padded = padding ? normalized.padEnd(normalized.length + (4 - padding), '=') : normalized
  return atob(padded)
}

export const decodeJwt = (token) => {
  if (!token) return null

  try {
    const [, payload] = token.split('.')
    if (!payload) return null
    return JSON.parse(decodeBase64Url(payload))
  } catch {
    return null
  }
}

export const isTokenExpired = (token) => {
  const payload = decodeJwt(token)
  if (!payload?.exp) return true
  return payload.exp * 1000 <= Date.now() + 5000
}

export const mergeAuthUser = (authUser = {}, profile = {}) => ({
  ...authUser,
  ...profile,
  userId: profile.userId || authUser.userId || authUser.id || null,
  email: profile.email || authUser.email || '',
  fullName: profile.fullName || authUser.fullName || '',
  rollNumber: profile.rollNumber || authUser.rollNumber || '',
})

export const broadcastAuthEvent = (type) => {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(AUTH_SYNC_KEY, JSON.stringify({ type, at: Date.now() }))
  } catch {
    // Ignore storage failures in private browsing or restricted environments.
  }
}

export const isAuthEndpoint = (url = '') => (
  [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/check-email',
    '/api/auth/verify-otp',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
  ].some((path) => url.includes(path))
)
