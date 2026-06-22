/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sentinel: {
          bg: '#0a0f1e',
          card: '#0f1729',
          border: '#1e2d4a',
          accent: '#00d4ff',
          low: '#22c55e',
          medium: '#f59e0b',
          high: '#ef4444',
          critical: '#dc2626',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
