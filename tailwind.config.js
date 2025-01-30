/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    'bg-blue-100',
    'bg-green-100',
    'bg-gray-100',
    'bg-red-100',
    'bg-yellow-100',
    'text-blue-600',
    'text-blue-700',
    'text-green-600',
    'text-green-700',
    'text-gray-600',
    'text-gray-700',
    'text-red-600',
    'text-red-700',
    'text-yellow-600',
    'text-yellow-700',
  ],
};