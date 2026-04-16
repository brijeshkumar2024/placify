import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const PAGE_TITLES = {
  '/':                          'Placify TPO',
  '/login':                     'Sign In · Placify TPO',
  '/verify-otp':                'Verify Email · Placify TPO',
  '/register':                  'Create Account · Placify TPO',
  '/dashboard':                 'Dashboard · Placify TPO',
  '/dashboard/drives':          'Drives · Placify TPO',
  '/dashboard/students':        'Students · Placify TPO',
  '/dashboard/tracker':         'Placement Tracker · Placify TPO',
  '/dashboard/companies':       'Companies · Placify TPO',
  '/dashboard/reports':         'Reports · Placify TPO',
  '/dashboard/notifications':   'Notifications · Placify TPO',
  '/dashboard/settings':        'Settings · Placify TPO',
}

const DEFAULT_TITLE = 'Placify TPO'

export function useDocumentTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = PAGE_TITLES[pathname] ?? DEFAULT_TITLE
  }, [pathname])
}
