/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Cabinet Grotesk"', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
      },
      colors: {
        obsidian: {
          50:  '#f6f6f7',
          100: '#e2e2e5',
          200: '#c4c4ca',
          300: '#9b9ba5',
          400: '#72727f',
          500: '#5a5a66',
          600: '#474752',
          700: '#3a3a43',
          800: '#25252d',
          900: '#16161c',
          950: '#0d0d11',
        },
        amber: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        jade: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
      },
      boxShadow: {
        'glow-amber': '0 0 40px rgba(217,119,6,0.15)',
        'glow-sm':    '0 0 20px rgba(217,119,6,0.10)',
        'card':       '0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 8px rgba(0,0,0,0.5), 0 12px 32px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'shimmer': { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'pulse-amber': { '0%,100%': { boxShadow: '0 0 0 0 rgba(217,119,6,0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(217,119,6,0)' } },
      },
      animation: {
        'fade-up':     'fade-up 0.5s ease-out forwards',
        'fade-up-d1':  'fade-up 0.5s 0.1s ease-out both',
        'fade-up-d2':  'fade-up 0.5s 0.2s ease-out both',
        'fade-up-d3':  'fade-up 0.5s 0.3s ease-out both',
        'fade-up-d4':  'fade-up 0.5s 0.4s ease-out both',
        'fade-in':     'fade-in 0.4s ease-out forwards',
        'pulse-amber': 'pulse-amber 2s infinite',
      },
    },
  },
  plugins: [],
};
