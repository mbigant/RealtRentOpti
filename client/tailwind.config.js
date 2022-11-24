/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      {
        mytheme: {

          "primary": "#fcf158",

          "secondary": "#b2bef4",

          "accent": "#a7f9da",

          "neutral": "#281E2A",

          "base-100": "#2B4154",

          "info": "#8EC6F0",

          "success": "#14A363",

          "warning": "#A18412",

          "error": "#E2271D",
        },
      },
    ],
  },
  plugins: [
      require("daisyui")
  ],
}
