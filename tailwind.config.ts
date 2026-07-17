import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "void-black": "#000000",
        "ground-iron": "#181818",
        "carbon-veil": "#212525",
        "circuit-border": "#485346",
        "phosphor-blue-black": "#1f2a33",
        "charcoal-rust": "#231c1c",
        "lime-pulse": "#7fee64",
        "phosphor-white": "#ddffdc",
        "mint-frost": "#def0dd",
        "sage-60": "#8cab87",
        "sage-40": "#677d64",
        "moss-70": "#9cbf93",
        "moss-80": "#aed2a4",
        "fern-link": "#859984",
        "deep-fern": "#697368",
        "pine-15": "#3e4a3c",
      },
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["Fira Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        caption: ["12px", { lineHeight: "1.33", letterSpacing: "0.6px" }],
        "body-sm": ["14px", { lineHeight: "1.43", letterSpacing: "-0.364px" }],
        body: ["16px", { lineHeight: "1.5", letterSpacing: "-0.352px" }],
        subheading: ["20px", { lineHeight: "1.5", letterSpacing: "-0.36px" }],
        "heading-sm": ["24px", { lineHeight: "1.3", letterSpacing: "-0.312px" }],
        heading: ["30px", { lineHeight: "1.2", letterSpacing: "-0.36px" }],
        "heading-lg": ["42px", { lineHeight: "1.05", letterSpacing: "-0.336px" }],
        display: ["64px", { lineHeight: "1", letterSpacing: "-0.448px" }],
      },
      borderRadius: {
        cards: "8px",
        buttons: "12px",
        pills: "9999px",
      },
      maxWidth: {
        page: "1280px",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 20s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "loop-step": "loopStep 0.5s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        loopStep: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
