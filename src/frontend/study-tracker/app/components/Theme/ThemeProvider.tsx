import { createContext } from "react";
import classNames from "classnames";

export type AppTheme = "beige";

export namespace AppTheme {
    export const values: AppTheme[] = ["beige"];
    export const className: Record<AppTheme, string> = {
        beige: "beigeTheme"
    };
    export const defaultTheme = "beige";
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