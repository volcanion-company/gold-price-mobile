/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FFF9E6',
          100: '#FFF0B3',
          200: '#FFE680',
          300: '#FFD94D',
          400: '#FFCC1A',
          500: '#E6B800',
          600: '#B38F00',
          700: '#806600',
          800: '#4D3D00',
          900: '#1A1400',
        },
        up: {
          light: '#E8F5E9',
          DEFAULT: '#4CAF50',
          dark: '#2E7D32',
        },
        down: {
          light: '#FFEBEE',
          DEFAULT: '#F44336',
          dark: '#C62828',
        },
        dark: {
          background: '#121212',
          surface: '#1E1E1E',
          card: '#2D2D2D',
          border: '#404040',
          text: '#E4E4E7',
          muted: '#A1A1AA',
        },
      },
    },
  },
  plugins: [],
};
