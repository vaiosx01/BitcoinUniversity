import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        btcu: {
          primary: '#F7931A',      // Bitcoin orange
          secondary: '#4A90E2',    // Education blue
          accent: '#50E3C2',       // Mint green
          dark: '#0A0E27',         // Deep navy
          glass: 'rgba(255, 255, 255, 0.1)',
        },
      },
      backgroundImage: {
        'neural-gradient': 'radial-gradient(circle at 50% 50%, rgba(74, 144, 226, 0.15), rgba(247, 147, 26, 0.05), transparent)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'neural-pulse': 'neural-pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'neural-pulse': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'glow': {
          'from': { textShadow: '0 0 10px #F7931A, 0 0 20px #F7931A' },
          'to': { textShadow: '0 0 20px #F7931A, 0 0 30px #F7931A, 0 0 40px #F7931A' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-inset': 'inset 0 0 20px rgba(255, 255, 255, 0.05)',
        'neural': '0 0 40px rgba(74, 144, 226, 0.3)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

export default config

