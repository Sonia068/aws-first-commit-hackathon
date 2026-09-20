/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: { DEFAULT: '#2F3542', soft: '#5B6474', faint: '#8A93A3' },
        line: '#E8EAF0',
        // Pastel palette
        lilac: { 50: '#F7F5FF', 100: '#EEEAFE', 200: '#DDD6FB', 300: '#C7BBF6', 500: '#8B7BD8', 700: '#5B4BA8' },
        mint: { 50: '#F1FBF6', 100: '#DDF5E9', 200: '#BFEBD4', 500: '#4FB287', 700: '#2C7A59' },
        peach: { 50: '#FFF6F0', 100: '#FFE9DB', 200: '#FFD3BA', 500: '#E9895A', 700: '#A9552C' },
        sky: { 50: '#F0F8FF', 100: '#DDEFFD', 200: '#BADFFA', 500: '#4E9FDB', 700: '#256A9E' },
        butter: { 50: '#FFFBEA', 100: '#FFF3C4', 200: '#FCE58C', 500: '#D4A72C', 700: '#8A6B10' },
        rose: { 50: '#FFF3F6', 100: '#FFE1E9', 200: '#FFC7D5', 500: '#DB5F80', 700: '#A03657' },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(47,53,66,0.04), 0 8px 24px -12px rgba(47,53,66,0.12)',
      },
    },
  },
  plugins: [],
}
