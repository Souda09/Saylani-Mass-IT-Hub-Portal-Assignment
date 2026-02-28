/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 'oklch' error fix karne ke liye hexadecimal colors
        'saylani-blue': '#0057a8',
        'saylani-green': '#66b032',
      }
    },
  },
  plugins: [],
}