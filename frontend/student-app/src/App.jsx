import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/auth/LandingPage'
import OtpPage from './pages/auth/OtpPage'
import RegisterPage from './pages/auth/RegisterPage'
import LoginPage from './pages/auth/LoginPage'
import Dashboard from './pages/dashboard/Dashboard'
import DashboardLayout from './components/layout/DashboardLayout'
import useAuthStore from './store/authStore'

function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  return token ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/verify-otp" element={<OtpPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="jobs" element={<div className="p-8"><h2 className="text-2xl font-semibold text-gray-900">Job feed — coming next</h2></div>} />
        <Route path="applications" element={<div className="p-8"><h2 className="text-2xl font-semibold text-gray-900">Applications — coming next</h2></div>} />
        <Route path="interview" element={<div className="p-8"><h2 className="text-2xl font-semibold text-gray-900">Mock interview — coming next</h2></div>} />
        <Route path="roadmap" element={<div className="p-8"><h2 className="text-2xl font-semibold text-gray-900">Career roadmap — coming next</h2></div>} />
        <Route path="analytics" element={<div className="p-8"><h2 className="text-2xl font-semibold text-gray-900">My progress — coming next</h2></div>} />
        <Route path="notifications" element={<div className="p-8"><h2 className="text-2xl font-semibold text-gray-900">Notifications — coming next</h2></div>} />
        <Route path="settings" element={<div className="p-8"><h2 className="text-2xl font-semibold text-gray-900">Settings — coming next</h2></div>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App