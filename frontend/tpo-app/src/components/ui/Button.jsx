import { Loader2 } from 'lucide-react'

/**
 * Unified Button primitive
 * variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
 * size:    'sm' | 'md' | 'lg'
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const sizes = {
    sm:  'px-3 py-1.5 text-xs rounded-[10px]',
    md:  'px-4 py-2.5 text-sm rounded-[12px]',
    lg:  'px-5 py-3   text-[15px] rounded-[14px]',
  }

  const variants = {
    primary: {
      style: {
        background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #8b5cf6 100%)',
        backgroundSize: '200% 200%',
        boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
        color: '#fff',
        border: 'none',
      },
      className: 'hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(99,102,241,0.45)] active:scale-[0.98]',
    },
    secondary: {
      style: {
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: '#f1f5f9',
      },
      className: 'hover:bg-white/10 hover:border-white/20 active:scale-[0.98]',
    },
    ghost: {
      style: { background: 'transparent', border: '1px solid transparent', color: '#94a3b8' },
      className: 'hover:bg-white/5 hover:text-white active:scale-[0.98]',
    },
    outline: {
      style: {
        background: 'transparent',
        border: '1px solid rgba(99,102,241,0.4)',
        color: '#818cf8',
      },
      className: 'hover:bg-indigo-500/10 hover:border-indigo-400/60 active:scale-[0.98]',
    },
    danger: {
      style: {
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.25)',
        color: '#f87171',
      },
      className: 'hover:bg-red-500/20 hover:border-red-400/50 active:scale-[0.98]',
    },
  }

  const v = variants[variant] ?? variants.primary

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${v.className} ${fullWidth ? 'w-full' : ''} ${className}`}
      style={v.style}
      {...props}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : null}
      {children}
    </button>
  )
}
