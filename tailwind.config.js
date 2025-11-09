/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        slideDown: {
          from: {
            opacity: '0',
            transform: 'translateX(-50%) translateY(-20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(-50%) translateY(0)',
          },
        },
        slideUp: {
          from: {
            transform: 'translateY(20px)',
            opacity: '0',
          },
          to: {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        fadeIn: {
          from: {
            opacity: '0',
          },
          to: {
            opacity: '1',
          },
        },
        pulse: {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.8',
          },
        },
      },
      animation: {
        slideDown: 'slideDown 0.3s ease-out',
        slideUp: 'slideUp 0.3s ease-out',
        fadeIn: 'fadeIn 0.2s ease-in',
        pulse: 'pulse 2s infinite',
      },
    },
  },
  plugins: [],
}
