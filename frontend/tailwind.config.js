/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "azure-blue": "#397FFF",
        "cool-gray": "#858C9A",
        "dark-blue": "#141531",
        "flash-white": "#F1F3F6",
        "persian-green": "#1B998B",
        "sec-white": "#FDFDFE",
      }
    },
    boxShadow: {
      'input': '4px 4px 10px 4px rgba(20, 21, 49, 0.04)',
      'light': '4px 4px 12px 0px rgba(20, 21, 49, 0.12)',
    },
    fontFamily: {
      tomorrow: ['Tomorrow', 'sans-serif'],
      roboto: ['Roboto', 'sans-serif'],
    }
  },
  plugins: [],
}

