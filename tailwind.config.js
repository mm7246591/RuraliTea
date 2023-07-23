/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {}
    },
    screens: {
      sm: { max: '491px' },
      // => @media (min-width: 640px) { ... }

      md: { max: '768px' },
      // => @media (min-width: 768px) { ... }
      lg: { min: '1024px' },
      // => @media (min-width: 1024px) { ... }

      xl: { min: '1280px' },
      // => @media (min-width: 1280px) { ... }

      '2xl': { min: '1536px' }
      // => @media (min-width: 1536px) { ... }
    }
  },
  plugins: []
}
