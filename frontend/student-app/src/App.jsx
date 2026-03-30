import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/auth/LandingPage'
import OtpPage from './pages/auth/OtpPage'
import RegisterPage from './pages/auth/RegisterPage'
import LoginPage from './pages/auth/LoginPage'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Dashboard from './pages/dashboard/Dashboard'
import JobFeed from './pages/dashboard/JobFeed'
import DashboardLayout from './components/layout/DashboardLayout'
import useAuthStore from './store/authStore'
import Applications from './pages/dashboard/Applications'
import MockInterview from './pages/dashboard/MockInterview'
import CareerRoadmap from './pages/dashboard/CareerRoadmap'
import MyProgress from './pages/dashboard/MyProgress'
import Profile from './pages/dashboard/Profile'
import Notifications from './pages/dashboard/Notifications'
import Drives from './pages/dashboard/Drives'
import AuthGuard from './components/auth/AuthGuard'
import { AUTH_SYNC_KEY, decodeJwt } from './utils/auth'

function App() {
  const token = useAuthStore((s) => s.token)
  const logout = useAuthStore((s) => s.logout)

  useEffect(() => {
    if (!token) {
      return undefined
    }

    const payload = decodeJwt(token)
    const expiryAt = payload?.exp ? payload.exp * 1000 : 0

    if (!expiryAt || expiryAt <= Date.now()) {
      logout()
      return undefined
    }

    const timeoutId = globalThis.setTimeout(() => {
      logout()
      if (globalThis.location?.pathname !== '/login') {
        globalThis.location.replace('/login')
      }
    }, Math.max(expiryAt - Date.now(), 0))

    return () => globalThis.clearTimeout(timeoutId)
  }, [token, logout])

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== AUTH_SYNC_KEY || !event.newValue) {
        return
      }

      try {
        const payload = JSON.parse(event.newValue)
        if (payload?.type === 'logout') {
          logout({ broadcast: false })
        }
      } catch {
        // Ignore malformed sync events.
      }
    }

    globalThis.addEventListener('storage', handleStorage)
    return () => globalThis.removeEventListener('storage', handleStorage)
  }, [logout])

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/verify-otp" element={<OtpPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      <Route path="/dashboard" element={
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      }>
        <Route index element={<Dashboard />} />
        <Route path="jobs" element={<JobFeed />} />
        <Route path="drives" element={<Drives />} />
        <Route path="applications" element={<Applications />} />
        <Route path="interview" element={<MockInterview />} />
        <Route path="roadmap" element={<CareerRoadmap />} />
        <Route path="analytics" element={<MyProgress />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<div className="p-8"><h2 className="text-2xl font-semibold text-gray-900">Settings — coming next</h2></div>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
