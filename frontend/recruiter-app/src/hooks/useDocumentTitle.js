import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const PAGE_TITLES = {
  '/':                          'Placify Recruiter',
  '/login':                     'Sign In · Placify Recruiter',
  '/verify-otp':                'Verify Email · Placify Recruiter',
  '/register':                  'Create Account · Placify Recruiter',
  '/dashboard':                 'Dashboard · Placify Recruiter',
  '/dashboard/post-job':        'Post a Job · Placify Recruiter',
  '/dashboard/my-jobs':         'My Jobs · Placify Recruiter',
  '/dashboard/applicants':      'Applicants · Placify Recruiter',
  '/dashboard/interviews':      'Interviews · Placify Recruiter',
  '/dashboard/analytics':       'Analytics · Placify Recruiter',
  '/dashboard/reports':         'Reports · Placify Recruiter',
  '/dashboard/notifications':   'Notifications · Placify Recruiter',
  '/dashboard/settings':        'Settings · Placify Recruiter',
}

const DEFAULT_TITLE = 'Placify Recruiter'

export function useDocumentTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = PAGE_TITLES[pathname] ?? DEFAULT_TITLE
  }, [pathname])
}
