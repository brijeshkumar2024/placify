/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        placify: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        surface: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          800: '#0f172a',
          900: '#0a0f1a',
          950: '#020408',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm':  '0 0 15px rgba(99,102,241,0.3)',
        'glow':     '0 0 30px rgba(99,102,241,0.4)',
        'glow-lg':  '0 0 60px rgba(99,102,241,0.5)',
        'glow-xl':  '0 0 100px rgba(99,102,241,0.4)',
        'card':     '0 32px 64px rgba(0,0,0,0.5)',
        'card-lg':  '0 48px 96px rgba(0,0,0,0.6)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient':   'linear-gradient(135deg, #020408 0%, #0a0f1a 50%, #0d1117 100%)',
        'card-gradient':   'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        'btn-gradient':    'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #3b82f6 100%)',
      },
      animation: {
        'fade-in':      'fadeIn 0.5s ease-out both',
        'fade-in-up':   'fadeInUp 0.6s ease-out both',
        'fade-in-down': 'fadeInDown 0.6s ease-out both',
        'scale-in':     'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        'slide-in-left':'slideInLeft 0.6s ease-out both',
        'blob-float':   'blobFloat 12s ease-in-out infinite',
        'shimmer':      'shimmer 3s linear infinite',
        'pulse-glow':   'pulseGlow 2s ease-in-out infinite',
        'spin-slow':    'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn:      { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeInUp:    { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeInDown:  { from: { opacity: '0', transform: 'translateY(-24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:     { from: { opacity: '0', transform: 'scale(0.9)' }, to: { opacity: '1', transform: 'scale(1)' } },
        slideInLeft: { from: { opacity: '0', transform: 'translateX(-40px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        blobFloat: {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '33%':      { transform: 'translate(30px,-40px) scale(1.05)' },
          '66%':      { transform: 'translate(-20px,20px) scale(0.97)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99,102,241,0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(99,102,241,0.6)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      backdropBlur: {
        '4xl': '80px',
      },
    },
  },
  plugins: [],
}
