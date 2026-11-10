import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        traffiker: {
          orange: "#FF5A1F",
          "orange-hover": "#E54D15",
          "orange-light": "rgba(255, 90, 31, 0.12)",
          dark: "#0D0F12",
          "dark-card": "#191C21",
          "dark-border": "#292E36",
          "dark-hover": "#22272F",
          gray: "#CBD2DC",
          light: "#FFFFFF",
        },
      },
    },
  },
  plugins: [],
};
export default config;
