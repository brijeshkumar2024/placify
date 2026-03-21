import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('placify_token') || null,
  verifiedEmail: null,

  setVerifiedEmail: (email) => set({ verifiedEmail: email }),

  setAuth: (user, token) => {
    localStorage.setItem('placify_token', token)
    set({ user, token })
  },

  logout: () => {
    localStorage.removeItem('placify_token')
    set({ user: null, token: null })
  },
}))

export default useAuthStore