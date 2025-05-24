/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'isabelline': { 
          DEFAULT: '#EDE8E7', 
          100: '#352b28', 
          200: '#6b5551', 
          300: '#9d827d', 
          400: '#c5b5b2', 
          500: '#ede8e7', 
          600: '#f1edec', 
          700: '#f4f2f1', 
          800: '#f8f6f6', 
          900: '#fbfbfa' 
        }, 
        'silver': { 
          DEFAULT: '#C7C7C7', 
          100: '#282828', 
          200: '#505050', 
          300: '#777777', 
          400: '#9f9f9f', 
          500: '#c7c7c7', 
          600: '#d2d2d2', 
          700: '#dddddd', 
          800: '#e9e9e9', 
          900: '#f4f4f4' 
        }, 
        'timberwolf': { 
          DEFAULT: '#DCD6D4', 
          100: '#302927', 
          200: '#5f524e', 
          300: '#8f7c76', 
          400: '#b6a9a5', 
          500: '#dcd6d4', 
          600: '#e3dfdd', 
          700: '#eae7e6', 
          800: '#f1efee', 
          900: '#f8f7f7' 
        }, 
        'coquelicot': { 
          DEFAULT: '#FE3201', 
          100: '#330a00', 
          200: '#651501', 
          300: '#981f01', 
          400: '#cb2901', 
          500: '#fe3201', 
          600: '#fe5c34', 
          700: '#fe8567', 
          800: '#feae9a', 
          900: '#ffd6cc' 
        }
      }
    },
  },
  plugins: [],
}
