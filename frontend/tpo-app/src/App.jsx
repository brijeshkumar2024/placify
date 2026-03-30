import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/auth/LandingPage'
import OtpPage from './pages/auth/OtpPage'
import RegisterPage from './pages/auth/RegisterPage'
import LoginPage from './pages/auth/LoginPage'
import DashboardLayout from './components/layout/DashboardLayout'
import Dashboard from './pages/dashboard/Dashboard'
import Drives from './pages/dashboard/Drives'
import Students from './pages/dashboard/Students'
import Reports from './pages/dashboard/Reports'
import Companies from './pages/dashboard/Companies'
import Notifications from './pages/dashboard/Notifications'
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
        <ProtectedRoute><DashboardLayout /></ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="drives" element={<Drives />} />
        <Route path="students" element={<Students />} />
        <Route path="companies" element={<Companies />} />
        <Route path="reports" element={<Reports />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<div className="p-8"><h2 className="text-2xl font-semibold text-gray-900">Settings — coming soon</h2></div>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
