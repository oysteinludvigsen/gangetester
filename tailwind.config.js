/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      colors: {
        brand: {
          50: '#f2f7ff',
          100: '#e4efff',
          200: '#c7dcff',
          300: '#9ac0ff',
          400: '#6a9dff',
          500: '#3f7bff',
          600: '#2a5ef2',
          700: '#2149c2',
          800: '#1f3f99',
          900: '#1e397a',
        },
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '60%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        },
        floatUp: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-24px)', opacity: '0' },
        },
      },
      animation: {
        pop: 'pop 220ms cubic-bezier(0.2, 0.9, 0.3, 1.2)',
        shake: 'shake 320ms ease-in-out',
        floatUp: 'floatUp 700ms ease-out forwards',
      },
    },
  },
  plugins: [],
};
