import {
  BarChart2,
  Bell,
  Brain,
  Briefcase,
  Building2,
  FileText,
  LayoutDashboard,
  Map,
  Mic,
  User,
} from 'lucide-react'

export const sidebarSections = [
  {
    title: 'OVERVIEW',
    items: [
      { to: '/dashboard',              label: 'Dashboard',       icon: LayoutDashboard },
    ],
  },
  {
    title: 'CAREER',
    items: [
      { to: '/dashboard/jobs',         label: 'Job feed',        icon: Briefcase       },
      { to: '/dashboard/drives',       label: 'Drives',          icon: Building2       },
      { to: '/dashboard/applications', label: 'Applications',    icon: FileText        },
    ],
  },
  {
    title: 'GROWTH',
    items: [
      { to: '/dashboard/interview',    label: 'Mock interview',  icon: Mic             },
      { to: '/dashboard/roadmap',      label: 'Career roadmap',  icon: Map             },
      { to: '/dashboard/weakness',     label: 'AI Learning',     icon: Brain           },
      { to: '/dashboard/analytics',    label: 'My progress',     icon: BarChart2       },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { to: '/dashboard/profile',      label: 'My profile',      icon: User            },
      { to: '/dashboard/notifications',label: 'Notifications',   icon: Bell            },
    ],
  },
]

export const flatNavigationItems = sidebarSections.flatMap((s) => s.items)

const META = {
  '/dashboard':                  { title: 'Dashboard',        subtitle: 'Your placement overview and AI-powered insights.' },
  '/dashboard/jobs':             { title: 'Job Feed',          subtitle: 'Browse and apply to open positions.' },
  '/dashboard/drives':           { title: 'Placement Drives',  subtitle: 'Active campus drives and eligibility details.' },
  '/dashboard/applications':     { title: 'Applications',      subtitle: 'Track all your job applications and their status.' },
  '/dashboard/interview':        { title: 'Mock Interview',    subtitle: 'AI-powered practice interviews to sharpen your skills.' },
  '/dashboard/roadmap':          { title: 'Career Roadmap',    subtitle: 'Personalised learning path to your dream role.' },
  '/dashboard/weakness':         { title: 'AI Learning',       subtitle: 'Identify and address your skill gaps with AI.' },
  '/dashboard/analytics':        { title: 'My Progress',       subtitle: 'Performance metrics and placement journey.' },
  '/dashboard/profile':          { title: 'My Profile',        subtitle: 'Manage your resume, skills, and contact info.' },
  '/dashboard/notifications':    { title: 'Notifications',     subtitle: 'Alerts, drive updates, and offer letters.' },
}

export function getPageMeta(pathname = '/dashboard') {
  const exact = META[pathname]
  if (exact) return exact
  const match = flatNavigationItems.find((item) => pathname.startsWith(item.to) && item.to !== '/dashboard')
  return {
    title: match?.label ?? 'Dashboard',
    subtitle: 'Campus placement portal.',
  }
}
