import {
  Bell,
  Briefcase,
  CalendarDays,
  FileBarChart2,
  LayoutDashboard,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react'

export const sidebarSections = [
  {
    title: 'MAIN',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/dashboard/my-jobs', label: 'My Jobs', icon: Briefcase },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { to: '/dashboard/applicants', label: 'Applicants', icon: Users },
      { to: '/dashboard/interviews', label: 'Interviews', icon: CalendarDays },
    ],
  },
  {
    title: 'ANALYTICS',
    items: [
      { to: '/dashboard/analytics', label: 'Analytics', icon: Sparkles },
      { to: '/dashboard/reports', label: 'Reports', icon: FileBarChart2 },
    ],
  },
  {
    title: 'SETTINGS',
    items: [
      { to: '/dashboard/notifications', label: 'Notifications', icon: Bell },
      { to: '/dashboard/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export const flatNavigationItems = sidebarSections.flatMap((section) => section.items)

export const getPageMeta = (pathname = '/dashboard') => {
  if (pathname === '/dashboard') {
    return {
      title: 'Recruiter Command Center',
      subtitle: 'Track candidates, monitor interviews, and move faster on hiring decisions.',
    }
  }

  const match = flatNavigationItems.find((item) => pathname.startsWith(item.to))

  if (pathname.startsWith('/dashboard/applicants/')) {
    return {
      title: 'Applicants',
      subtitle: 'Review candidate pipelines, update statuses, and schedule interviews.',
    }
  }

  return {
    title: match?.label || 'Recruiter Workspace',
    subtitle: 'Premium hiring workflow built for speed, visibility, and collaboration.',
  }
}
