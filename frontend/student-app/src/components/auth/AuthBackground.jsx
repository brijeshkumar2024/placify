import { motion } from 'framer-motion'

export default function AuthBackground() {
  return (
    <>
      {/* Noise texture */}
      <div className="noise-overlay" />

      {/* Grid lines */}
      <div className="fixed inset-0 grid-bg opacity-100 pointer-events-none z-0" />

      {/* Animated gradient blobs */}
      <div className="gradient-mesh">
        <motion.div
          className="mesh-blob mesh-blob-1"
          animate={{ x: [0, 40, -20, 0], y: [0, -50, 30, 0], scale: [1, 1.08, 0.96, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="mesh-blob mesh-blob-2"
          animate={{ x: [0, -50, 30, 0], y: [0, 40, -30, 0], scale: [1, 0.95, 1.06, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
        <motion.div
          className="mesh-blob mesh-blob-3"
          animate={{ x: [0, 60, -40, 0], y: [0, -30, 50, 0], scale: [1, 1.1, 0.92, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
        />
      </div>
    </>
  )
}
