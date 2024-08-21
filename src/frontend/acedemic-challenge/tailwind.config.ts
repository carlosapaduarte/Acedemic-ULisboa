import type {Config} from "tailwindcss";

export default {
    content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: "#771480",
                secondary: "#7DF4BE",
                'purple-dark': "#491351",
                'yellow': "#FFE600"
            },
        }
    },
    plugins: [],
} satisfies Config;
