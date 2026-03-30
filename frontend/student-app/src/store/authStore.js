import { create } from 'zustand'
import { broadcastAuthEvent } from '../utils/auth'

export const TOKEN_KEY = 'placify_token'
export const USER_KEY = 'placify_user'

const readStoredUser = () => {
  if (typeof window === 'undefined') return null

  try {
    const raw = sessionStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    sessionStorage.removeItem(USER_KEY)
    return null
  }
}

const initialToken = typeof window !== 'undefined'
  ? sessionStorage.getItem(TOKEN_KEY) || null
  : null

const useAuthStore = create((set) => ({
  user: readStoredUser(),
  token: initialToken,
  verifiedEmail: null,
  authLoading: Boolean(initialToken),
  authChecked: !initialToken,

  setVerifiedEmail: (email) => set({ verifiedEmail: email }),

  startAuthCheck: () => set({ authLoading: true, authChecked: false }),

  finishAuthCheck: () => set({ authLoading: false, authChecked: true }),

  setAuth: (user, token) => {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    sessionStorage.setItem(TOKEN_KEY, token)
    sessionStorage.setItem(USER_KEY, JSON.stringify(user))
    set({ user, token, verifiedEmail: null, authLoading: true, authChecked: false })
  },

  setUser: (user) => {
    if (user) {
      sessionStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      sessionStorage.removeItem(USER_KEY)
    }

    set({ user, authLoading: false, authChecked: true })
  },

  patchUser: (fields) => set((state) => {
    const currentUser = state.user || {}
    const updated = { ...currentUser, ...fields }
    sessionStorage.setItem(USER_KEY, JSON.stringify(updated))
    return { user: updated, authLoading: false, authChecked: true }
  }),

  logout: (options = {}) => {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    set({ user: null, token: null, verifiedEmail: null, authLoading: false, authChecked: true })

    if (options.broadcast !== false) {
      broadcastAuthEvent('logout')
    }
  },
}))

export default useAuthStore
