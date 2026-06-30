/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#080c10',
        text: '#c9d4e0',
        surface: '#0e1520',
        surface2: '#141f2e',
        border: '#1e2d3d',
        teal: {
          DEFAULT: '#00cec9',
          dim: '#008f8c',
          glow: 'rgba(0,206,201,0.12)',
        },
        pitch: '#00b894',
        red: '#e63946',
        amber: '#f0a500',
        muted: '#6a7f96',
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
        body: ['system-ui', '-apple-system', 'sans-serif'],
        mono: ['Courier New', 'monospace'],
      },
      animation: {
        'pulse-dot': 'pulse-dot 1.2s ease-in-out infinite',
        'goal': 'goal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.2' },
        },
        'goal': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
