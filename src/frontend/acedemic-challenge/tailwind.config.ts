import type {Config} from "tailwindcss";

export default {
    content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: "#771480",
                secondary: "#7DF4BE",
            },
        }
    },
    plugins: [],
} satisfies Config;
