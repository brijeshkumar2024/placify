import { AlertTriangle, Inbox, SearchX, WifiOff } from 'lucide-react'

/**
 * Empty / Error state component
 * type: 'empty' | 'error' | 'search' | 'offline'
 */
const PRESETS = {
  empty:   { Icon: Inbox,         title: 'Nothing here yet',     color: '#818cf8', glow: 'rgba(99,102,241,0.15)'  },
  error:   { Icon: AlertTriangle, title: 'Something went wrong', color: '#f87171', glow: 'rgba(239,68,68,0.15)'   },
  search:  { Icon: SearchX,       title: 'No results found',     color: '#60a5fa', glow: 'rgba(59,130,246,0.15)'  },
  offline: { Icon: WifiOff,       title: 'Connection lost',      color: '#fbbf24', glow: 'rgba(245,158,11,0.15)'  },
}

export default function Empty({
  type = 'empty',
  title,
  description,
  action,
  className = '',
}) {
  const { Icon, title: defaultTitle, color, glow } = PRESETS[type] ?? PRESETS.empty

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: glow, border: `1px solid ${color}30` }}
      >
        <Icon size={24} style={{ color }} />
      </div>

      <p className="text-[15px] font-semibold text-white mb-1.5">
        {title ?? defaultTitle}
      </p>

      {description && (
        <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-5">
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

/** Inline error banner */
export function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm"
      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
      <div className="flex items-center gap-2.5 text-red-300">
        <AlertTriangle size={15} className="flex-shrink-0" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button onClick={onRetry}
          className="text-xs font-semibold text-red-400 hover:text-red-300 transition flex-shrink-0">
          Retry
        </button>
      )}
    </div>
  )
}
