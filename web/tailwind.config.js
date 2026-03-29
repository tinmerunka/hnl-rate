/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'hnl-red': '#e63946',
        'hnl-red-dark': '#c1121f',
        'hnl-dark': '#0f1117',
        'hnl-bg': '#1c1f2e',
        'hnl-card': '#252838',
      },
    },
  },
  plugins: [],
}

