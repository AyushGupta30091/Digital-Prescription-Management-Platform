// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1a5276",
        secondary: "#2e86c1",
        accent: "#148f77",
      },
    },
  },
  plugins: [],
};