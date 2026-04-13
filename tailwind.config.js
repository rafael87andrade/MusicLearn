/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'rev-dark': '#191c1f',
        'rev-white': '#ffffff',
        'rev-surface': '#f4f4f4',
        'rev-ghost': 'rgba(244, 244, 244, 0.1)',
        'rui-blue': '#494fdf',
        'rui-teal': '#00a87e',
        'rui-deep-pink': '#e61e49',
        'rui-warning': '#ec7e00',
        'rui-yellow': '#b09000',
        'rui-light-blue': '#007bc2',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      letterSpacing: {
        'tighter': '-0.02em',
        'tight': '-0.01em',
        'normal': '0.16px',
        'wide': '0.02em',
        'wider': '0.04em',
        'widest': '0.24px',
      }
    },
  },
  plugins: [],
};
