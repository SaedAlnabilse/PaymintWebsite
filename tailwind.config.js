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
          DEFAULT: '#7cc39f',
          light: '#a3d9be',
          dark: '#5ba382',
        },
        dark: {
          DEFAULT: '#1a1a1a',
          light: '#2d2d2d',
        },
        neutral: {
          bg: '#F7F9FA',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}