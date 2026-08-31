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
        ink: "#0f172a",
        muted: "#64748b",
        line: "#e9e5ff",
        surface: "#faf9ff",
        brand: "#7c3aed",
        brandDark: "#6d28d9",
        brandSoft: "#f5f3ff",
        brandBorder: "#ede9fe",
        purpleDark: "#1e0b3b",
        purpleMid: "#4b1e7c",
        purpleLight: "#8a4af3",
        accentCyan: "#0ed3ff",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 8px 24px -8px rgba(124,58,237,0.08)',
        'soft-lg': '0 16px 40px -12px rgba(124,58,237,0.12)',
        'lift': '0 12px 32px -10px rgba(124,58,237,0.18)',
      },
      maxWidth: {
        'content': '1160px',
      },
    },
  },
  plugins: [],
}

