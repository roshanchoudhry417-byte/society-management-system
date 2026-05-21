/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#09090b', // zinc-950
          card: '#18181b', // zinc-900
          cardHover: '#27272a', // zinc-800
          text: '#f4f4f5', // zinc-100
          subtext: '#a1a1aa', // zinc-400
          border: '#3f3f46', // zinc-700
        },
        brand: {
          accent: '#8b5cf6', // violet-500
          accentHover: '#7c3aed', // violet-600
          glow: 'rgba(139, 92, 246, 0.4)', // violet glow
          success: '#10b981', // emerald-500
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'glow': '0 0 15px rgba(139, 92, 246, 0.5)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
