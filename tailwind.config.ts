import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Bahnschrift", '"Segoe UI"', '"Segoe UI Variable Text"', "sans-serif"],
        display: ['"Segoe UI Semibold"', "Bahnschrift", '"Segoe UI"', "sans-serif"],
      },
      boxShadow: {
        tech: "0 22px 60px rgba(2, 6, 23, 0.42)",
      },
    },
  },
  plugins: [],
} satisfies Config;
