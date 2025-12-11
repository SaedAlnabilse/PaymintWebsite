/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mint: {
          DEFAULT: '#7CC39F',
          light: '#9DD4B5',
          dark: '#5FAF87',
        },
        paymint: {
          green: '#7CC39F',
          dark: '#000000', // Main background
          light: '#FFFFFF', // Main text
          gray: '#9CA3AF', // Subtitles
          surface: '#121212', // Cards/Sections
        },
        dark: {
          DEFAULT: '#000000',
          light: '#1A1A1A',
        },
        accent: {
          DEFAULT: '#D55263',
          light: '#E07584',
          dark: '#B8404F',
        },
        neutral: {
          bg: '#000000',
          white: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        paymint: ['Crimson Text', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}