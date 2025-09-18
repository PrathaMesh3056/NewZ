/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        red: {
          600: '#dc2626',
          700: '#b91c1c',
        }
      }
    },
  },
  plugins: [],
  // Tailwind CSS v4 specific settings
  future: {
    hoverOnlyWhenSupported: true,
  },
}