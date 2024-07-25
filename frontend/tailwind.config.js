/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        "primary-blue": "#526ed3",
      },
      display: ["group-hover"],
    },
  },
  safelist: [
    {
      pattern:
        /bg-(red|orange|green|cyan|blue|purple)-(100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern:
        /text-(red|orange|green|cyan|blue|purple)-(100|200|300|400|500|600|700|800|900)/,
    },
  ],
  plugins: [],
};
