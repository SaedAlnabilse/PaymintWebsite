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
          dark: '#1F1D2B',
          gray: '#718096',
        },
        dark: {
          DEFAULT: '#1F1D2B',
          light: '#2A2838',
        },
        accent: {
          DEFAULT: '#D55263',
          light: '#E07584',
          dark: '#B8404F',
        },
        neutral: {
          bg: '#F7F9FA',
          white: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        paymint: ['Crimson Text', 'serif'],
      },
    },
  },
  plugins: [],
}