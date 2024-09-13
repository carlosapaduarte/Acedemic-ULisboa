import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteError } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { AuthnContainer } from "~/components/auth/Authn";
import { NotFoundPage } from "~/Pages/NotFoundPage";
import { Footer } from "~/components/Footer";

import "./global.css";
import "./i18n";
import "./themes.css";
import { AppBar, AppBarProvider } from "~/components/AppBar/AppBar";
import { useEffect, useState } from "react";
import {
    AppTheme,
    getBodyThemeClassNames,
    getLocalStorageTheme,
    ThemeProvider
} from "~/components/Theme/ThemeProvider";

export const meta: MetaFunction = () => {
    return [
        { title: "Acedemic Challenge" },
        { name: "Acedemic Challenge", content: "Acedemic Challenge" }
    ];
};

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <head>
            <meta charSet="utf-8" />
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
            />
            <title>Acedemic Challenge</title>
            <Meta />
            <Links />
        </head>
        <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        </body>
        </html>
    );
}

export default function Root() {
    const [isHydrated, setIsHydrated] = useState(false);
    const [theme, setTheme] = useState<AppTheme>("default");

    useEffect(() => {
        const storedTheme = getLocalStorageTheme();

        setTheme(storedTheme);

        setIsHydrated(true);
    }, []);

    useEffect(() => {
        document.body.className = getBodyThemeClassNames(theme);
    }, [theme]);

    if (!isHydrated) {
        return null;
    }

    return (
        <AuthnContainer>
            <ThemeProvider theme={theme} setTheme={setTheme}>
                <App />
            </ThemeProvider>
        </AuthnContainer>
    );
}

export function App() {
    return (
        <AppBarProvider>
            <div className="app">
                <AppBar />
                <div className="mainContentContainer">
                    <Outlet />
                </div>
                <Footer />
            </div>
        </AppBarProvider>
    );
}

export function ErrorBoundary() {
    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            return (
                <NotFoundPage />
            );
        }
        return (
            <div>
                <h1>
                    {error.status} {error.statusText}
                </h1>
                <p>{error.data}</p>
            </div>
        );
    } else if (error instanceof Error) {
        return (
            <div>
                <h1>Error</h1>
                <p>{error.message}</p>
                <p>The stack trace is:</p>
                <pre>{error.stack}</pre>
            </div>
        );
    } else {
        return <h1>Unknown Error</h1>;
    }
}
