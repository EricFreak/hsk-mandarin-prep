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
        paper: {
          DEFAULT: "#FAF8F5",
          dark: "#F0EBE3",
        },
        ink: {
          DEFAULT: "#1A1A2E",
          muted: "#5C5C6F",
        },
        seal: {
          DEFAULT: "#C23B3B",
          dark: "#9E2F2F",
        },
        jade: {
          DEFAULT: "#2D6A6A",
          light: "#3D8A8A",
        },
        mist: "#E8E4DF",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 24px -4px rgba(26, 26, 46, 0.08)",
        lift: "0 12px 40px -8px rgba(26, 26, 46, 0.12)",
      },
      backgroundImage: {
        "brush-rule":
          "linear-gradient(90deg, transparent, #C23B3B 20%, #C23B3B 80%, transparent)",
      },
    },
  },
  plugins: [],
};
export default config;
