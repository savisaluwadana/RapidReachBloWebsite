import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Billion-Dollar Color Palette
        'deep-charcoal': {
          DEFAULT: '#0B0B0B',
          50: '#1A1A1A',
          100: '#0F0F0F',
          200: '#0B0B0B',
          300: '#080808',
          400: '#050505',
        },
        'electric-cyan': {
          DEFAULT: '#326CE5', // Kubernetes Blue
          50: '#E8F0FE',
          100: '#B8D4FD',
          200: '#88B8FC',
          300: '#589CFA',
          400: '#3D84F1',
          500: '#326CE5',
          600: '#2858C4',
          700: '#1E44A3',
          800: '#143082',
          900: '#0A1C61',
        },
        'cyber-lime': {
          DEFAULT: '#00FF88',
          50: '#E5FFF5',
          100: '#B3FFE0',
          200: '#80FFCC',
          300: '#4DFFB8',
          400: '#1AFFA4',
          500: '#00FF88',
          600: '#00CC6E',
          700: '#009954',
          800: '#00663A',
          900: '#003320',
        },
        'glass': {
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.05)',
          dark: 'rgba(0, 0, 0, 0.2)',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-cyber': 'linear-gradient(135deg, #326CE5 0%, #00FF88 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0B0B0B 0%, #1A1A1A 100%)',
        'mesh-gradient': 'radial-gradient(at 40% 20%, rgba(50, 108, 229, 0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(0, 255, 136, 0.2) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(50, 108, 229, 0.2) 0px, transparent 50%)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'Menlo', 'Monaco', 'monospace'],
      },
      fontSize: {
        'display-lg': ['6rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-sm': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'fade-in': 'fadeIn 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'kinetic-text': 'kineticText 3s ease-in-out infinite',
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
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(50, 108, 229, 0.5), 0 0 40px rgba(0, 255, 136, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(50, 108, 229, 0.8), 0 0 80px rgba(0, 255, 136, 0.5)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        kineticText: {
          '0%, 100%': { transform: 'translateX(0) skew(0deg)' },
          '25%': { transform: 'translateX(2px) skew(1deg)' },
          '75%': { transform: 'translateX(-2px) skew(-1deg)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(50, 108, 229, 0.5)',
        'glow-md': '0 0 20px rgba(50, 108, 229, 0.6)',
        'glow-lg': '0 0 40px rgba(50, 108, 229, 0.7)',
        'glow-cyber': '0 0 30px rgba(0, 255, 136, 0.6)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'bento': '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
