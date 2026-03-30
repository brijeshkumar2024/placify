import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/auth/LandingPage'
import OtpPage from './pages/auth/OtpPage'
import RegisterPage from './pages/auth/RegisterPage'
import LoginPage from './pages/auth/LoginPage'
import DashboardLayout from './components/layout/DashboardLayout'
import Dashboard from './pages/dashboard/Dashboard'
import PostJob from './pages/dashboard/PostJob'
import MyJobs from './pages/dashboard/MyJobs'
import Applicants from './pages/dashboard/Applicants'
import ApplicantsHub from './pages/dashboard/ApplicantsHub'
import Interviews from './pages/dashboard/Interviews'
import Analytics from './pages/dashboard/Analytics'
import Reports from './pages/dashboard/Reports'
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
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="post-job" element={<PostJob />} />
        <Route path="my-jobs" element={<MyJobs />} />
        <Route path="applicants" element={<ApplicantsHub />} />
        <Route path="applicants/:jobId" element={<Applicants />} />
        <Route path="interviews" element={<Interviews />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="reports" element={<Reports />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="interview/*" element={<Navigate to="/dashboard/interviews" replace />} />
        <Route
          path="settings"
          element={(
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
              <p className="mt-2 text-sm text-gray-500">Workspace preferences, recruiter profile options, and notification controls will live here.</p>
            </div>
          )}
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App