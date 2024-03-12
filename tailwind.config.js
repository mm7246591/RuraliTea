/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {}
    },
    screens: {
      '3sm': { max: '320px' },
      '2sm': { max: '380px' },
      sm: { max: '491px' },
      md: { max: '768px' },
      lg: { min: '1024px' },
      xl: { min: '1280px' },
      '2xl': { min: '1536px' }
    }
  },
  plugins: []
}
