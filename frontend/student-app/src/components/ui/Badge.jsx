/**
 * Unified Badge primitive
 * variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
 * dot: boolean — show animated pulse dot
 */
const CONFIG = {
  default: { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', border: 'rgba(148,163,184,0.2)' },
  success: { bg: 'rgba(16,185,129,0.12)',  color: '#34d399',  border: 'rgba(16,185,129,0.25)' },
  warning: { bg: 'rgba(245,158,11,0.12)',  color: '#fbbf24',  border: 'rgba(245,158,11,0.25)' },
  danger:  { bg: 'rgba(239,68,68,0.12)',   color: '#f87171',  border: 'rgba(239,68,68,0.25)'  },
  info:    { bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa',  border: 'rgba(59,130,246,0.25)' },
  purple:  { bg: 'rgba(139,92,246,0.12)',  color: '#a78bfa',  border: 'rgba(139,92,246,0.25)' },
  indigo:  { bg: 'rgba(99,102,241,0.12)',  color: '#818cf8',  border: 'rgba(99,102,241,0.25)' },
}

export default function Badge({ children, variant = 'default', dot = false, className = '' }) {
  const c = CONFIG[variant] ?? CONFIG.default

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${className}`}
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: c.color, animation: 'badgePulse 2s ease-in-out infinite' }}
        />
      )}
      {children}
    </span>
  )
}
