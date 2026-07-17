import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "ink-black":    "#17191c",
        "paper-white":  "#ffffff",
        "mist-gray":    "#f2f2f3",
        "fog-white":    "#fafafb",
        "slate-gray":   "#777b86",
        "ash-gray":     "#979799",
        "smoke-gray":   "#a3a6af",
        "blush-peach":  "#fbe1d1",
        "sienna-brown": "#5d2a1a",
        "border-light": "#ececec",
      },
      fontFamily: {
        signifier: ["'Source Serif 4'", "Georgia", "ui-serif", "serif"],
        sohne:     ["Inter",            "ui-sans-serif", "system-ui", "sans-serif"],
        mono:      ["'Fira Mono'",      "ui-monospace", "monospace"],
      },
      fontSize: {
        caption:      ["15px", { lineHeight: "1.5" }],
        body:         ["17px", { lineHeight: "1.35" }],
        "body-lg":    ["20px", { lineHeight: "1.35" }],
        subheading:   ["22px", { lineHeight: "1.5" }],
        "heading-sm": ["26px", { lineHeight: "1.18", letterSpacing: "-0.23px" }],
        heading:      ["44px", { lineHeight: "1.3",  letterSpacing: "-0.66px" }],
        "heading-lg": ["64px", { lineHeight: "1.3",  letterSpacing: "-0.96px" }],
        display:      ["90px", { lineHeight: "1.3",  letterSpacing: "-2.25px" }],
      },
      borderRadius: {
        cards:    "24px",
        images:   "12px",
        inputs:   "16px",
        buttons:  "9999px",
        sm_cards: "16px",
        el_cards: "20px",
      },
      maxWidth: { page: "1200px" },
      boxShadow: {
        artifact: "0 0 0 1px rgba(4,23,43,0.05), 0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.10)",
        subtle:   "0 0 0 1px rgba(0,0,0,0.05), 0 4px 24px 0px rgba(0,0,0,0.08)",
        subtle2:  "0 0 0 1px rgba(0,0,0,0.05), 0 8px 40px 0px rgba(0,0,0,0.10)",
      },
      keyframes: {
        fadeUp:   { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        loopIn:   { "0%": { opacity: "0", transform: "translateY(8px)"  }, "100%": { opacity: "1", transform: "translateY(0)" } },
        tickerIn: { "0%": { opacity: "0", transform: "translateY(6px)"  }, "100%": { opacity: "1", transform: "translateY(0)" } },
        blink:    { "0%,100%": { opacity: "1" }, "50%": { opacity: "0" } },
      },
      animation: {
        "fade-up":  "fadeUp 0.6s ease-out forwards",
        "loop-in":  "loopIn 0.4s ease-out forwards",
        "ticker-in":"tickerIn 0.35s ease-out forwards",
        "blink":    "blink 1s step-end infinite",
      },
    },
  },
  plugins: [],
};
export default config;
