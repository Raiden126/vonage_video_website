/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        floatUp: {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(-120px)", opacity: "0" },
        },
      },
      animation: {
        floatUp: "floatUp 2.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};
