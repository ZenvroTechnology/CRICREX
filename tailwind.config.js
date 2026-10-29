/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#123D2A',
          50: '#EEF5F1',
          100: '#D8E9DF',
          200: '#B2D3C0',
          300: '#7FB497',
          400: '#4A8F6C',
          500: '#2D6F4F',
          600: '#217346',
          700: '#1A5A38',
          800: '#123D2A',
          900: '#0C2C1E',
          950: '#071B13',
        },
        cricket: {
          DEFAULT: '#217346',
          light: '#2C8B58',
          dark: '#185734',
        },
        grass: {
          DEFAULT: '#8BCB75',
          light: '#B7E3A8',
          dark: '#63AC4C',
        },
        offwhite: '#F5F7F2',
        matchday: {
          DEFAULT: '#FF9F43',
          light: '#FFB870',
          dark: '#F08A1F',
        },
        slateink: {
          DEFAULT: '#344054',
          light: '#667085',
          faint: '#98A2B3',
        },
        success: '#16A34A',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 10px -2px rgba(18, 61, 42, 0.08), 0 6px 24px -8px rgba(18, 61, 42, 0.08)',
        card: '0 1px 2px rgba(18, 61, 42, 0.04), 0 12px 32px -12px rgba(18, 61, 42, 0.14)',
        lift: '0 24px 60px -24px rgba(18, 61, 42, 0.35)',
        innerline: 'inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96) translateY(6px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'scale-in': 'scale-in 0.25s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-down': 'slide-down 0.2s ease-out both',
        float: 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(120% 120% at 80% 10%, rgba(139,203,117,0.28) 0%, rgba(18,61,42,0) 55%), radial-gradient(100% 100% at 0% 100%, rgba(33,115,70,0.5) 0%, rgba(18,61,42,0) 60%)',
      },
    },
  },
  plugins: [],
};
