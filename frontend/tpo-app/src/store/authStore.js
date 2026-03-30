import { create } from 'zustand'
const useAuthStore = create((set) => ({
  user: null,
  token: sessionStorage.getItem('placify_tpo_token') || null,
  verifiedEmail: null,
  setVerifiedEmail: (email) => set({ verifiedEmail: email }),
  setAuth: (user, token) => {
    sessionStorage.setItem('placify_tpo_token', token)
    set({ user, token })
  },
  logout: () => {
    sessionStorage.removeItem('placify_tpo_token')
    set({ user: null, token: null })
  },
}))
export default useAuthStore
