import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#00E59B",
        "primary-dark": "#00C785",
        background: {
          dark: "#050508",
          light: "#FFFFFF",
        },
        accent: {
          danger: "#FF4757",
          warning: "#FFA033",
        },
        text: {
          dark: "#E8ECF4",
          light: "#1A1A2E",
        },
      },
    },
  },
  plugins: [],
};
export default config;
