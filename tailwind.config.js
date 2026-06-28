/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#43332c',
          dark: '#2d2219',
          light: '#6b5548',
          lighter: '#9a7b6e',
          50: '#fdf6f3',
          100: '#f5e8e0',
          200: '#e8cfc2',
        },
        gold: {
          DEFAULT: '#c9a15e',
          light: '#e8c98a',
          dark: '#a67c3a',
        },
        cream: '#fdfaf8',
      },
      fontFamily: {
        display: ['Georgia', 'Cambria', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'gradient': 'gradientShift 8s ease infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'count-up': 'countUp 2s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'confetti': 'confetti 1s ease-in-out forwards',
        'rotate-book': 'rotateBook 20s ease-in-out infinite',
        'typewriter': 'typewriter 3s steps(40) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201,161,94,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(201,161,94,0.7)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        rotateBook: {
          '0%': { transform: 'rotateY(-30deg) rotateX(5deg)' },
          '50%': { transform: 'rotateY(-20deg) rotateX(-5deg)' },
          '100%': { transform: 'rotateY(-30deg) rotateX(5deg)' },
        },
        confetti: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '0' },
          '50%': { transform: 'scale(1.2) rotate(180deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(360deg)', opacity: '1' },
        },
      },
      backgroundSize: { '200%': '200% 200%' },
    },
  },
  plugins: [],
};
