/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html",
    ],
    theme: {
      extend: {
        colors: {
          thesis: {
            primary: "#27374D",
            secondary: "#F43F5E",
            accent: "#7F56D9",
            info: "#38BDF8",
            success: "#34D399",
            warning: "#FBBF24",
            danger: "#EF4444",
            surface: "#1E293B",
            background: "#0F172A",
          },
        },
      },
    },
    plugins: [require("daisyui")],
    daisyui: {
      themes: [
        {
          thesisconnect: {
            primary: "#27374D",
            "primary-content": "#ffffff",
            secondary: "#F43F5E",
            "secondary-content": "#ffffff",
            accent: "#7F56D9",
            "accent-content": "#ffffff",
            neutral: "#3D4451",
            "neutral-content": "#ffffff",
            "base-100": "#0F172A",
            "base-200": "#1E293B",
            "base-300": "#27374D",
            "base-content": "#E2E8F0",
            info: "#38BDF8",
            success: "#34D399",
            warning: "#FBBF24",
            error: "#EF4444",
          },
        },
        "dark", // fallback theme
      ],
    },
  };
  