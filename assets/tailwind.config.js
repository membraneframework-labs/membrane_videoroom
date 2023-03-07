module.exports = {
  content: ["../lib/*_web/**/*.*ex", "./src/**/*.tsx"],
  theme: {
    flex: {
      3: "3",
      1: "1",
    },
    extend: {
      rotate: {
        45: "45deg",
        135: "135deg",
      },
      invert: {
        50: ".50",
      },
      spacing: {
        50: "12.5rem",
      },
      fontFamily: {
        aktivGrotesk: [
          "aktiv-grotesk",
          "Roboto",
          "sans-serif",
          '"Inter"',
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
        ],
        rocGrotesk: [
          "roc-grotesk",
          "Roboto",
          "sans-serif",
          '"Inter"',
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
        ],
      },
      colors: {
        "brand-white": "#FFFFFF",
        "brand-gray": "#B0B5D8",
        "brand-dark-gray": "#90A4AE",
        "brand-light-gray": "#fafafa",
        "brand-sea-blue": {
          100: "#F1FAFE",
          200: "#BFE7F8",
          300: "#87CCE8",
          400: "#46ADD8",
          500: "#1F7193",
        },
        "brand-dark-blue": {
          100: "#F5F7FE",
          200: "#BFCCF8",
          300: "#7089DB",
          400: "#3F57A6",
          500: "#001A72",
        },
        "brand-yellow": {
          100: "#FCFDED",
          200: "#EBF391",
          300: "#DEEE2B",
          400: "#A2AD1F",
          500: "#606619",
        },
        "brand-green": {
          100: "#F3FCFA",
          200: "#B0E8DD",
          300: "#61D1BB",
          400: "#339988",
          500: "#206055",
        },
        "brand-violet": {
          100: "#F6F5FF",
          200: "#D2CFFD",
          300: "#A69EFA",
          400: "#675AF1",
          500: "#4339AC",
        },
        "brand-pink": {
          100: "#FFF5FA",
          200: "#FDCFE5",
          300: "#FA9ECC",
          400: "#E467A6",
          500: "#AC3973",
        },
        "brand-grey": {
          20: "#F8F9FB",
          30: "#EBEEF5",
          40: "#D9DDE8",
          60: "#B2B9CC",
          80: "#70778F",
          100: "#515970",
          120: "#2F354C",
          140: "#151A28",
        },
        "brand-second-violet": "#5A669D",
        "brand-beige": "#F1F1F4",
        "brand-second-beige": "#BABFD1",
        "brand-black": "#151A28",
        "brand-graphite": "#2E3440",
        "brand-second-graphite": "#191B25",
        "brand-red": "#C32222",
        text: {
          additional: "#506195",
          "additional-light": "#ACB5D2",
          light: "#DBE0F0",
          description: "#2D4186",
        },
      },
      gap: {
        18: "72px",
      },
      maxWidth: {
        "1/3": "calc(100% / 3)",
      },
      screens: {
        "3xl": "3200px",
      },
      gridTemplateColumns: {
        "3/1": "minmax(0, 3fr) minmax(0, 1fr)",
      },
      gridTemplateRows: {
        "3/1": "minmax(0, 3fr) minmax(0, 1fr)",
      },
      backgroundImage: {
        "videoroom-background": "url('/images/videoroomBackground.png')",
      },
    },
  },
  plugins: [],
};
