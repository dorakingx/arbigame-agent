import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10131f",
        graphite: "#2b3146",
        electric: "#16d9e3",
        arbitrum: "#2d6cdf",
        ember: "#ff7a59",
        violet: "#8b5cf6"
      },
      boxShadow: {
        glow: "0 0 42px rgba(22, 217, 227, 0.25)"
      }
    }
  },
  plugins: []
};

export default config;
