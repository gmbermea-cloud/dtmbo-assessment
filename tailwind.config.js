/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1B2A4A',
          50: '#EEF1F6',
          100: '#D6DCE8',
          600: '#243A63',
          700: '#1B2A4A',
          800: '#141F38',
          900: '#0D1526',
        },
        gold: {
          DEFAULT: '#C9973D',
          50: '#FBF3E4',
          100: '#F5E4C2',
          400: '#D7AC5C',
          500: '#C9973D',
          600: '#AD7E2C',
        },
        track: {
          D: '#B5563C',
          T: '#4C6B57',
          P: '#1B2A4A',
          B: '#C9973D',
          O: '#6B4E71',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
