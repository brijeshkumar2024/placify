/**
 * Unified Card primitive
 * variant: 'default' | 'glow' | 'flat' | 'dashboard'
 * padding: 'sm' | 'md' | 'lg' | 'none'
 */
export function Card({ children, variant = 'default', padding = 'md', className = '', style = {}, ...props }) {
  const paddings = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' }

  const variants = {
    default: {
      background: 'rgba(255,255,255,0.03)',
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '1rem',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    },
    glow: {
      background: 'rgba(255,255,255,0.03)',
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      border: '1px solid rgba(99,102,241,0.2)',
      borderRadius: '1rem',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 40px rgba(99,102,241,0.08)',
    },
    flat: {
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '1rem',
    },
    dashboard: {
      background: 'rgba(255,255,255,0.03)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '1rem',
    },
  }

  return (
    <div
      className={`${paddings[padding]} ${className}`}
      style={{ ...variants[variant], ...style }}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-[15px] font-semibold text-white leading-snug ${className}`}>
      {children}
    </h3>
  )
}

export default Card
