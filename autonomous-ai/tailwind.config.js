/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'space': {
          900: '#0A0A0F',
          800: '#12121F',
          700: '#1A1A2E',
          600: '#252540',
          500: '#333355',
        },
        'cyber': {
          DEFAULT: '#00F0FF',
          dim: '#00F0FF40',
          glow: '#00F0FF20',
        },
        'nebula': {
          DEFAULT: '#7B2DFF',
          dim: '#7B2DFF40',
          glow: '#7B2DFF20',
        },
        'safe': {
          DEFAULT: '#00FF88',
          dim: '#00FF8840',
          glow: '#00FF8820',
        },
        'alert': {
          DEFAULT: '#FFB800',
          dim: '#FFB80040',
        },
        'danger': {
          DEFAULT: '#FF2D55',
          dim: '#FF2D5540',
        },
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #00F0FF40, 0 0 10px #00F0FF20' },
          '100%': { boxShadow: '0 0 20px #00F0FF60, 0 0 40px #00F0FF30' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}