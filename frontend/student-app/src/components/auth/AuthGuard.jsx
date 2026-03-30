import { useEffect, useRef } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { userApi } from '../../services/api'
import { isTokenExpired, mergeAuthUser } from '../../utils/auth'

function AuthLoader() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white px-6 py-8 shadow-sm">
        <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-sm text-gray-500">Loading your account…</p>
      </div>
    </div>
  )
}

export default function AuthGuard({ children }) {
  const location = useLocation()
  const {
    token,
    user,
    authLoading,
    authChecked,
    startAuthCheck,
    finishAuthCheck,
    setUser,
    logout,
  } = useAuthStore()

  const requestInFlight = useRef(false)
  const expired = Boolean(token) && isTokenExpired(token)

  useEffect(() => {
    if (expired) {
      logout()
    }
  }, [expired, logout])

  useEffect(() => {
    if (!token) {
      requestInFlight.current = false
      finishAuthCheck()
      return
    }

    if (expired || authChecked || requestInFlight.current) {
      return
    }

    requestInFlight.current = true
    startAuthCheck()
    let active = true

    userApi.getProfile()
      .then((res) => {
        if (!active) return
        const profile = res?.data?.data || {}
        const currentUser = useAuthStore.getState().user || {}
        setUser(mergeAuthUser(currentUser, profile))
      })
      .catch((error) => {
        if (!active) return
        console.error('Auth guard failed to hydrate profile:', error)
        logout()
      })
      .finally(() => {
        if (active) {
          requestInFlight.current = false
        }
      })

    return () => {
      active = false
    }
  }, [authChecked, expired, finishAuthCheck, logout, setUser, startAuthCheck, token])

  if (!token || expired) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (authLoading || !authChecked || !user) {
    return <AuthLoader />
  }

  return children
}
