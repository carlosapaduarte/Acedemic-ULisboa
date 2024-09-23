import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteError } from "@remix-run/react";
import { AuthnContainer } from "~/components/auth/Authn";

import "./global.css";
import "./i18n";
import "./themes.css";
import { AppBar, AppBarProvider } from "~/components/AppBar/AppBar";
import * as React from "react";
import { useEffect, useState } from "react";
import { AppTheme, getAppThemeClassNames, getLocalStorageTheme, ThemeProvider } from "~/components/Theme/ThemeProvider";
import { MetaFunction } from "@remix-run/node";
import { NotFoundPage } from "~/Pages/NotFoundPage";
import { Footer } from "~/components/Footer/Footer";
import { GlobalErrorContainer } from "./components/error/GlobalErrorContainer";
import { GlobalErrorController } from "./components/error/GlobalErrorController";
import { useTranslation } from "react-i18next";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { LoadingScreen } from "~/components/LoadingScreen/LoadingScreen";

export const meta: MetaFunction = () => {
    return [
        { title: "Acedemic Tracker" },
        { name: "Acedemic Tracker", content: "Acedemic Tracker" }
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
            <title>Acedemic Tracker</title>
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
    const [theme, setTheme] = useState<AppTheme>(AppTheme.defaultTheme);

    useEffect(() => {
        const storedTheme = getLocalStorageTheme();

        setTheme(storedTheme);
    }, []);

    useEffect(() => {
        document.body.className = getAppThemeClassNames(theme);
    }, [theme]);

    return (
        <GlobalErrorContainer>
            <AuthnContainer>
                <ThemeProvider theme={theme} setTheme={setTheme}>
                    <App />
                </ThemeProvider>
            </AuthnContainer>
        </GlobalErrorContainer>
    );
}

export function App() {
    const { t } = useTranslation(["error"]);

    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setLoaded(true);
    }, []);

    return (
        <AppBarProvider>
            <div className="app">
                {loaded ?
                    <>
                        <AppBar />
                        <div className="mainContentContainer">
                            <ReactErrorBoundary fallback={<h1>{t("error:title")}</h1>}>
                                <GlobalErrorController>
                                    <Outlet />
                                </GlobalErrorController>
                            </ReactErrorBoundary>
                        </div>

                    </>
                    :
                    <LoadingScreen />
                }
                <Footer />
            </div>
        </AppBarProvider>
    );
}

export function ErrorBoundary() {
    const error = useRouteError();

    const { t } = useTranslation(["error"]);

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
                <h1>{t("error:title")}</h1>
            </div>
        );
    } else {
        return <h1>Unknown Error</h1>;
    }
}
