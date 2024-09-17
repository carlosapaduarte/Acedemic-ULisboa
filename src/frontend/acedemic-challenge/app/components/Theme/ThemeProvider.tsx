import { createContext } from "react";
import classNames from "classnames";

export type AppTheme = "purple" | "black" | "blue";

export namespace AppTheme {
    export const values: AppTheme[] = ["purple", "black", "blue"];
    export const className: Record<AppTheme, string> = {
        purple: "purpleTheme",
        black: "blackTheme",
        blue: "blueTheme"
    };
    export const defaultTheme = "purple";
}

export const ThemeContext = createContext<{
    theme: AppTheme,
    setTheme: (theme: AppTheme) => void
}>({
    theme: AppTheme.defaultTheme,
    setTheme: () => {
    }
});

export function getAppThemeClassNames(theme: AppTheme) {
    return classNames(AppTheme.className[theme]);
}

export function getLocalStorageTheme(): AppTheme {
    const storedTheme = localStorage.getItem("theme") as AppTheme | null;
    if (storedTheme) {
        return storedTheme;
    } else {
        localStorage.setItem("theme", AppTheme.defaultTheme.toString());
        return AppTheme.defaultTheme;
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