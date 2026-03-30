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
import { userApi } from './services/api'

function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  return token ? children : <Navigate to="/login" replace />
}

function App() {
  const { user, token, patchUser } = useAuthStore()

  // If user is logged in but fullName is missing (stale cache), fetch from profile
  useEffect(() => {
    if (token && user && !user.fullName) {
      userApi.getProfile()
        .then(res => {
          const profile = res.data?.data
          if (profile?.fullName) patchUser({ fullName: profile.fullName })
        })
        .catch(() => {})
    }
  }, [token])

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/verify-otp" element={<OtpPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
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
