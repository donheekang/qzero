import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#00E59B",
          "green-dark": "#00C785",
          blue: "#3182F6",
          "blue-light": "#E8F3FF",
          "blue-dark": "#1B64DA",
        },
        toss: {
          bg: "#F4F5F7",
          "bg-dark": "#EAEBEE",
          dark: "#191F28",
          "dark-elevated": "#26282D",
          "text-primary": "#191F28",
          "text-secondary": "#4E5968",
          "text-tertiary": "#8B95A1",
          "text-disabled": "#B0B8C1",
          red: "#F04452",
          "red-light": "#FFF0F0",
          orange: "#F59F00",
          "orange-light": "#FFF8E6",
          "green-light": "#E5FFF3",
        },
      },
      borderRadius: {
        "2.5xl": "20px",
      },
      letterSpacing: {
        tighter: "-0.6px",
        "tight-sm": "-0.3px",
      },
      boxShadow: {
        toss: "0 2px 8px rgba(0,0,0,0.06)",
        "toss-lg": "0 4px 16px rgba(0,0,0,0.08)",
        "toss-xl": "0 8px 24px rgba(0,0,0,0.1)",
      },
    },
  },
  plugins: [],
};
export default config;
