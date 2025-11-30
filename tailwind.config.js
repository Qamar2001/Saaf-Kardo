/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#5E35B1', // Deep Purple
                secondary: '#00BCD4', // Cyan/Teal
            }
        },
    },
    plugins: [],
}
