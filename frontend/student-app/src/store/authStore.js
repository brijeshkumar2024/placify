import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: JSON.parse(sessionStorage.getItem('placify_user') || 'null'),
  token: sessionStorage.getItem('placify_token') || null,
  verifiedEmail: null,

  setVerifiedEmail: (email) => set({ verifiedEmail: email }),

  setAuth: (user, token) => {
    sessionStorage.setItem('placify_token', token)
    sessionStorage.setItem('placify_user', JSON.stringify(user))
    set({ user, token })
  },

  patchUser: (fields) => set((state) => {
    const updated = { ...state.user, ...fields }
    sessionStorage.setItem('placify_user', JSON.stringify(updated))
    return { user: updated }
  }),

  logout: () => {
    sessionStorage.removeItem('placify_token')
    sessionStorage.removeItem('placify_user')
    set({ user: null, token: null })
  },
}))

export default useAuthStore
