/**
 * Spinner / full-page loader
 * size: 'sm' | 'md' | 'lg'
 * fullPage: boolean — centered in viewport
 */
export default function Spinner({ size = 'md', fullPage = false, label = '' }) {
  const dims = { sm: 'w-4 h-4 border-[1.5px]', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-[3px]' }

  const ring = (
    <div
      className={`${dims[size]} rounded-full border-white/20 border-t-white animate-spin`}
      role="status"
      aria-label={label || 'Loading'}
    />
  )

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4"
        style={{ background: 'rgba(11,15,25,0.85)', backdropFilter: 'blur(8px)' }}>
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-white/5 border-t-indigo-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-white/5 border-t-purple-400 animate-spin"
              style={{ animationDuration: '0.7s', animationDirection: 'reverse' }} />
          </div>
        </div>
        {label && <p className="text-sm text-slate-400 animate-pulse">{label}</p>}
      </div>
    )
  }

  return ring
}

/** Skeleton shimmer block */
export function Skeleton({ className = '', style = {} }) {
  return (
    <div
      className={`rounded-xl animate-pulse ${className}`}
      style={{ background: 'rgba(255,255,255,0.05)', ...style }}
    />
  )
}

/** Inline loading row */
export function LoadingRows({ count = 3, height = 'h-14' }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={`${height} w-full`}
          style={{ opacity: 1 - i * 0.2 }} />
      ))}
    </div>
  )
}
