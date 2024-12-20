import {
    isRouteErrorResponse,
    json,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
    useRouteError
} from "@remix-run/react";
import { AuthnContainer } from "~/components/auth/Authn";

import "./global.css";
import "./themes.css";
import { AppBar } from "~/components/AppBar/AppBar";
import * as React from "react";
import { useEffect, useState } from "react";
import { AppTheme, getAppThemeClassNames, getLocalStorageTheme, ThemeProvider } from "~/components/Theme/ThemeProvider";
import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { NotFoundPage } from "~/Pages/NotFoundPage";
import { Footer } from "~/components/Footer/Footer";
import { GlobalErrorContainer } from "./components/error/GlobalErrorContainer";
import { GlobalErrorController } from "./components/error/GlobalErrorController";
import { useTranslation } from "react-i18next";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { LoadingOverlay } from "~/components/LoadingScreen/LoadingScreen";
import i18next from "~/i18next.server";
import { useChangeLanguage } from "remix-i18next/react";
import { AppBarProvider } from "~/components/AppBar/AppBarProvider";

export async function loader({ request }: LoaderFunctionArgs) {
    let locale = await i18next.getLocale(request);
    let t = await i18next.getFixedT(request);
    let metaDescription = t("common:meta_description");

    return json({ locale, metaDescription });
}

export let handle = {
    // In the handle export, we can add a i18n key with namespaces our route
    // will need to load. This key can be a single string or an array of strings.
    // TIP: In most cases, you should set this to your defaultNS from your i18n config
    // or if you did not set one, set it to the i18next default namespace "translation"
    i18n: ["common", "error"]
};

// @ts-ignore
export const meta: MetaFunction = ({ data }: { data: { locale: string, metaDescription: string } }) => {
    return [
        { title: "Acedemic Tracker" },
        {
            name: "description",
            content: data.metaDescription
        }
    ];
};

export function Layout({ children }: { children: React.ReactNode }) {
    // Get the locale from the loader
    let { locale } = useLoaderData<typeof loader>();

    let { i18n } = useTranslation();

    useChangeLanguage(locale);

    return (
        <html lang={locale} dir={i18n.dir()}>
        <head>
            <meta charSet="utf-8" />
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
            />
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

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 1000));

        Promise.all([minLoadingTime]).then(() => {
            setLoading(false);
        });
    }, []);

    return (
        <AppBarProvider>
            <div className="app">
                <AppBar aria-hidden={loading ? true : undefined} />
                <main className="mainContentContainer" aria-hidden={loading}>
                    <ReactErrorBoundary fallback={<h1>{t("error:title")}</h1>}>
                        <GlobalErrorController>
                            <Outlet />
                        </GlobalErrorController>
                    </ReactErrorBoundary>
                </main>
                <Footer aria-hidden={loading ? true : undefined} />
                <LoadingOverlay loading={loading} />
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
