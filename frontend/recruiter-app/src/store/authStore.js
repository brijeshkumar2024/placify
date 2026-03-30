import { create } from 'zustand'

const TOKEN_KEY = 'placify_recruiter_token'
const USER_KEY  = 'placify_recruiter_user'

const useAuthStore = create((set) => ({
  user:          JSON.parse(sessionStorage.getItem(USER_KEY) || 'null'),
  token:         sessionStorage.getItem(TOKEN_KEY) || null,
  verifiedEmail: null,

  setVerifiedEmail: (email) => set({ verifiedEmail: email }),

  setAuth: (user, token) => {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    sessionStorage.setItem(TOKEN_KEY, token)
    sessionStorage.setItem(USER_KEY, JSON.stringify(user))
    set({ user, token, verifiedEmail: null })
  },

  logout: () => {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    set({ user: null, token: null, verifiedEmail: null })
  },
}))

export default useAuthStore
