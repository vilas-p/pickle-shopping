import type { Config } from "tailwindcss";

const withAlpha = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          background: withAlpha("--color-background"),
          foreground: withAlpha("--color-text"),
          card: withAlpha("--color-card"),
          muted: withAlpha("--color-muted"),
          border: withAlpha("--color-border"),
        },
        brand: {
          primary: {
            50: "#FFF7ED",
            100: "#FFEDD5",
            200: "#FED7AA",
            300: "#FDBA74",
            400: "#FB923C",
            500: "#F59E0B",
            600: "#D97706",
            700: "#B45309",
            800: "#92400E",
            900: "#78350F",
            DEFAULT: "#D97706",
          },
          secondary: {
            50: "#FEFCE8",
            100: "#FEF9C3",
            200: "#FEF08A",
            300: "#FDE047",
            400: "#FACC15",
            500: "#EAB308",
            600: "#CA8A04",
            700: "#A16207",
            800: "#854D0E",
            900: "#713F12",
            DEFAULT: "#EAB308",
          },
          accent: {
            50: "#F7FEE7",
            100: "#ECFCCB",
            200: "#D9F99D",
            300: "#BEF264",
            400: "#A3E635",
            500: "#65A30D",
            600: "#4D7C0F",
            700: "#3F6212",
            800: "#365314",
            900: "#1A2E05",
            DEFAULT: "#4D7C0F",
          },
          cream: {
            50: "#FAF7F2",
            100: "#F5EEE3",
            200: "#EADCC8",
            300: "#DEC6A7",
            400: "#CDAA7A",
            DEFAULT: "#FAF7F2",
          },
          earth: {
            50: "#FAF6F1",
            100: "#EFE4D9",
            200: "#DDC7B3",
            300: "#C4A184",
            400: "#A97B59",
            500: "#875B3D",
            600: "#68442E",
            700: "#4E3526",
            800: "#3F2D20",
            900: "#24150D",
            DEFAULT: "#3F2D20",
          },
          leaf: {
            500: "#65A30D",
            600: "#4D7C0F",
            700: "#3F6212",
          },
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
        script: ["'Caveat'", "cursive"],
      },
      borderRadius: {
        brand: "0.5rem",
        "brand-sm": "0.375rem",
        "brand-lg": "0.75rem",
      },
      boxShadow: {
        warm: "0 18px 42px -22px rgba(217, 119, 6, 0.55)",
        card: "0 12px 30px -20px rgba(63, 45, 32, 0.35)",
        premium: "0 24px 70px -36px rgba(63, 45, 32, 0.42)",
        inset: "inset 0 1px 0 rgba(255, 255, 255, 0.65)",
      },
      backgroundImage: {
        "warm-grain":
          "linear-gradient(135deg, rgba(250, 247, 242, 0.96), rgba(245, 238, 227, 0.92)), radial-gradient(circle at 22% 18%, rgba(234, 179, 8, 0.14) 0, transparent 34%), radial-gradient(circle at 80% 76%, rgba(217, 119, 6, 0.12) 0, transparent 36%)",
        "spice-wash":
          "linear-gradient(135deg, rgba(217, 119, 6, 0.96), rgba(180, 83, 9, 0.98)), radial-gradient(circle at 18% 24%, rgba(234, 179, 8, 0.32) 0, transparent 30%)",
        "heritage-dark":
          "linear-gradient(135deg, #24150D, #3F2D20 55%, #4D7C0F)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "soft-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "spice-shimmer": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 600ms ease-out both",
        "soft-float": "soft-float 5s ease-in-out infinite",
        "spice-shimmer": "spice-shimmer 2.2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
