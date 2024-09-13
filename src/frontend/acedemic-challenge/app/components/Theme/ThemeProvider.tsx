import { createContext } from "react";
import classNames from "classnames";

export type AppTheme = "default" | "purple" | "black";

export const ThemeContext = createContext<{
    theme: AppTheme,
    setTheme: (theme: AppTheme) => void
}>({
    theme: "default",
    setTheme: () => {
    }
});

export function getBodyThemeClassNames(theme: AppTheme) {
    return classNames(
        theme === "default" && "defaultTheme",
        theme === "purple" && "purpleTheme",
        theme === "black" && "blackTheme"
    );
}

export function getLocalStorageTheme(): AppTheme {
    const storedTheme = localStorage.getItem("theme") as AppTheme | null;
    if (storedTheme) {
        return storedTheme;
    } else {
        localStorage.setItem("theme", "default");
        return "default";
    }
}

export function ThemeProvider({ theme, setTheme, children }: {
    theme: AppTheme,
    setTheme: (theme: AppTheme) => void,
    children: React.ReactNode
}) {
    function setThemeAndStore(theme: AppTheme) {
        setTheme(theme);
        localStorage.setItem("theme", theme);
    }

    return (
        <ThemeContext.Provider value={{ theme: theme, setTheme: setThemeAndStore }}>
            {children}
        </ThemeContext.Provider>
    );
}