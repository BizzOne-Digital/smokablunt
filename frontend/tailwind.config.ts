import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:       "#0e0e0e",
        surface:  "#161616",
        surfaceHi:"#1e1e1e",
        card:     "#141414",
        border:   "#252525",
        borderHi: "#303030",
        green:    "#10b981",
        greenLo:  "#059669",
        greenBg:  "#0a1f17",
        textPri:  "#f0f0f0",
        textSec:  "#8a9a8e",
        textDim:  "#505a52",
        error:    "#f87171",
        errorBg:  "#1f1010",
      },
      fontFamily: {
        sans:  ["Inter", "sans-serif"],
        title: ["Montserrat", "sans-serif"],
      },
      maxWidth: { site: "1280px" },
    },
  },
  plugins: [],
};
export default config;
