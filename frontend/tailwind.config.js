/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        audiowide: ['Audiowide', 'cursive'],
      },
      animation: {
        'pulse': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 8s ease-in-out infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        float: {
          '0%': { 
            transform: 'translateY(0) scale(1)',
            opacity: 0.8,
          },
          '50%': { 
            transform: 'translateY(-20px) scale(1.2)',
            opacity: 0.4,
          },
          '100%': { 
            transform: 'translateY(0) scale(1)',
            opacity: 0.8,
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'neon': '0 0 15px rgba(0,255,255,0.3)',
        'neon-hover': '0 0 25px rgba(0,255,255,0.5)',
        'neon-strong': '0 0 35px rgba(0,255,255,0.7)',
      },
    },
  },
  plugins: [],
}

