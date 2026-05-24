/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0a031a",
        purpleDark: "#1e0b3b",
        purpleMid: "#4b1e7c",
        purpleLight: "#8a4af3",
        accentCyan: "#0ed3ff",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

