/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#254F9E',
        secondary: '#4F9EFF',
        highlight: '#FFD700',
        success: '#25D366',
        warning: '#FFAA00',
        error: '#FF4C4C',
        inputBg: '#F2F3F5',
        // Light mode colors
        light: {
          bg: {
            primary: '#FFFFFF',
            secondary: '#F8F9FA',
            tertiary: '#F2F3F5'
          },
          text: {
            primary: '#1A1A1A',
            secondary: '#4B5563',
            tertiary: '#6B7280'
          },
          border: '#E5E7EB'
        },
        // Dark mode colors
        dark: {
          bg: {
            primary: '#1A1A1A',
            secondary: '#2D2D2D',
            tertiary: '#404040'
          },
          text: {
            primary: '#FFFFFF',
            secondary: '#D1D5DB',
            tertiary: '#9CA3AF'
          },
          border: '#404040'
        }
      },
    },
  },
  plugins: [],
}

