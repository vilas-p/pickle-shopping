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
            50: "#F3F6EA",
            100: "#E7ECD6",
            200: "#CFD8AE",
            300: "#B2BF84",
            400: "#8FA35B",
            500: "#667737",
            600: "#2E380D",
            700: "#273009",
            800: "#212807",
            900: "#1A1F05",
            DEFAULT: "#2E380D",
          },
          secondary: {
            50: "#FBF5EC",
            100: "#F6EAD7",
            200: "#EFD4AF",
            300: "#E0B77E",
            400: "#D09C5B",
            500: "#C08A3E",
            600: "#A27232",
            700: "#845A27",
            800: "#67441D",
            900: "#4D3215",
            DEFAULT: "#C08A3E",
          },
          accent: {
            50: "#F6F2EE",
            100: "#ECE4DB",
            200: "#D8C9B7",
            300: "#C0A88A",
            400: "#9E7C61",
            500: "#7B5B45",
            600: "#5F4432",
            700: "#3E2A1E",
            800: "#1B120C",
            900: "#120B07",
            DEFAULT: "#1B120C",
          },
          cream: {
            50: "#F8F2E7",
            100: "#F1E8D8",
            200: "#E7D9BE",
            300: "#D8C4A0",
            400: "#C7AA7F",
            DEFAULT: "#F8F2E7",
          },
          earth: {
            50: "#F6F2EE",
            100: "#EDE5DC",
            200: "#DCCABD",
            300: "#C5AA95",
            400: "#A5846C",
            500: "#85614A",
            600: "#674835",
            700: "#4B3223",
            800: "#2E1E14",
            900: "#1B120C",
            DEFAULT: "#1B120C",
          },
          leaf: {
            500: "#667737",
            600: "#2E380D",
            700: "#273009",
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
        warm: "0 18px 42px -22px rgba(46, 56, 13, 0.45)",
        card: "0 12px 30px -20px rgba(27, 18, 12, 0.32)",
        premium: "0 24px 70px -36px rgba(27, 18, 12, 0.42)",
        inset: "inset 0 1px 0 rgba(255, 255, 255, 0.65)",
      },
      backgroundImage: {
        "warm-grain":
          "linear-gradient(135deg, rgba(248, 242, 231, 0.96), rgba(241, 232, 216, 0.92)), radial-gradient(circle at 22% 18%, rgba(192, 138, 62, 0.16) 0, transparent 34%), radial-gradient(circle at 80% 76%, rgba(46, 56, 13, 0.12) 0, transparent 36%)",
        "spice-wash":
          "linear-gradient(135deg, rgba(46, 56, 13, 0.96), rgba(27, 18, 12, 0.98)), radial-gradient(circle at 18% 24%, rgba(192, 138, 62, 0.32) 0, transparent 30%)",
        "heritage-dark":
          "linear-gradient(135deg, #1B120C, #2E380D 55%, #C08A3E)",
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
