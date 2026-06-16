/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        coffee: {
          50: '#F5F1EB',
          100: '#E8E4E0',
          200: '#D4CCBC',
          300: '#C4A882',
          400: '#B8976E',
          500: '#A8865A',
          600: '#8B6F4E',
          700: '#6D573D',
          800: '#5A3E2B',
          900: '#3D2A1A',
        },
      },
    },
  },
  plugins: [],
};
