/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/screens/**/*.{js,jsx,ts,tsx}',
    './app/components/**/*.{js,jsx,ts,tsx}',
    './app/App.js',
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      theme: {
        extend: {
          colors: {
            primary: '#4F46E5',
            secondary: '#10B981',
            background: '#F9FAFB',
            accent: '#F59E0B',
          },
        },
      },
    },
  },
  plugins: [],
}

