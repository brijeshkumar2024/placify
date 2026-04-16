import {
  Activity,
  Bell,
  Building2,
  FileBarChart2,
  GraduationCap,
  LayoutDashboard,
  Settings,
} from 'lucide-react'

export const sidebarSections = [
  {
    title: 'OVERVIEW',
    items: [
      { to: '/dashboard',          label: 'Dashboard',         icon: LayoutDashboard },
      { to: '/dashboard/drives',   label: 'Placement drives',  icon: Building2       },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { to: '/dashboard/students', label: 'Students',          icon: GraduationCap   },
      { to: '/dashboard/tracker',  label: 'Placement tracker', icon: Activity        },
      { to: '/dashboard/companies',label: 'Companies',         icon: Building2       },
    ],
  },
  {
    title: 'REPORTS',
    items: [
      { to: '/dashboard/reports',        label: 'Reports',       icon: FileBarChart2 },
      { to: '/dashboard/notifications',  label: 'Notifications', icon: Bell          },
    ],
  },
]

export const flatNavigationItems = sidebarSections.flatMap((s) => s.items)

const META = {
  '/dashboard':              { title: 'TPO Command Centre',   subtitle: 'Monitor placement drives, students, and live data.' },
  '/dashboard/drives':       { title: 'Placement Drives',     subtitle: 'Create and manage active company drives.' },
  '/dashboard/students':     { title: 'Students',             subtitle: 'View, filter, and track all registered students.' },
  '/dashboard/tracker':      { title: 'Placement Tracker',    subtitle: 'Real-time application funnel and status updates.' },
  '/dashboard/companies':    { title: 'Companies',            subtitle: 'Company profiles, offer details, and drive history.' },
  '/dashboard/reports':      { title: 'Reports',              subtitle: 'Placement reports and batch-wise analytics.' },
  '/dashboard/notifications':{ title: 'Notifications',        subtitle: 'Broadcast messages and student alerts.' },
}

export function getPageMeta(pathname = '/dashboard') {
  const exact = META[pathname]
  if (exact) return exact
  const match = flatNavigationItems.find((item) => pathname.startsWith(item.to) && item.to !== '/dashboard')
  return {
    title: match?.label ?? 'TPO Portal',
    subtitle: 'Campus placement management.',
  }
}
