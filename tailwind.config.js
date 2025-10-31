/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        warriorsBlue: "#1D428A",
        warriorsGold: "#FDB927",
        warriorsBg: "#0B0F1A",
        textMuted: "#AAB2C3",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};
