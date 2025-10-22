/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        mono: ["IBM Plex Mono", ...defaultTheme.fontFamily.mono],
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        zinc: {
          850: "#1D1D20",
        },
      },
    },
  },
  plugins: [],
};
