/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 18px 50px -24px rgba(15, 23, 42, 0.28)',
      },
      colors: {
        brand: '#102A43',
        accent: '#2563EB',
      },
    },
  },
  plugins: [],
}
