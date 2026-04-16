import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const PAGE_TITLES = {
  '/':                        'Placify Student',
  '/login':                   'Sign In · Placify Student',
  '/verify-otp':              'Verify Email · Placify Student',
  '/register':                'Create Account · Placify Student',
  '/forgot-password':         'Forgot Password · Placify Student',
  '/reset-password':          'Reset Password · Placify Student',
  '/dashboard':               'Dashboard · Placify Student',
  '/dashboard/jobs':          'Job Feed · Placify Student',
  '/dashboard/drives':        'Drives · Placify Student',
  '/dashboard/applications':  'Applications · Placify Student',
  '/dashboard/interview':     'Mock Interview · Placify Student',
  '/dashboard/roadmap':       'Career Roadmap · Placify Student',
  '/dashboard/analytics':     'My Progress · Placify Student',
  '/dashboard/notifications': 'Notifications · Placify Student',
  '/dashboard/profile':       'Profile · Placify Student',
  '/dashboard/settings':      'Settings · Placify Student',
}

const DEFAULT_TITLE = 'Placify Student'

export function useDocumentTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = PAGE_TITLES[pathname] ?? DEFAULT_TITLE
  }, [pathname])
}
