import {
    isRouteErrorResponse,
    json,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
    useRouteError,
} from "@remix-run/react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { AuthnContainer, useAuthn } from "~/components/auth/Authn";
import { NotFoundPage } from "./Pages/NotFoundPage";
import { Footer } from "~/components/Footer/Footer";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

import "./global.css";
import "./themes.css";
import { AppBar } from "./components/AppBar/AppBar";
import React, { useEffect, useState } from "react";
import {
    AppTheme,
    getAppThemeClassNames,
    getLocalStorageTheme,
    ThemeProvider,
} from "~/components/Theme/ThemeProvider";
import i18next from "~/i18next.server";
import { useChangeLanguage } from "remix-i18next/react";
import { useTranslation } from "react-i18next";
import { GlobalErrorContainer } from "~/components/error/GlobalErrorContainer";
import { GlobalErrorController } from "~/components/error/GlobalErrorController";
import { LoadingOverlay } from "~/components/LoadingScreen/LoadingScreen";
import { AppBarProvider } from "~/components/AppBar/AppBarProvider";
import { ChallengeTutorial } from "~/components/Tutorial/ChallengeTutorial";
import { t } from "i18next";

export async function loader({ request }: LoaderFunctionArgs) {
    let locale = await i18next.getLocale(request);
    let t = await i18next.getFixedT(request);
    let metaDescription = t("common:meta_description");

    return json({ locale, metaDescription });
}

export let handle = {
    i18n: ["common", "error"],
};

// @ts-ignore
export const meta: MetaFunction = ({
    data,
}: {
    data: { locale: string; metaDescription: string };
}) => {
    const description = data?.metaDescription || "Academic Challenge";
    return [
        { title: "Academic Challenge" },
        {
            name: "description",
            content: description,
        },
    ];
};

export function Layout({ children }: { children: React.ReactNode }) {
    const data = useLoaderData<typeof loader>();

    const locale = data?.locale ?? "pt";

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
    const authData = useAuthn();
    const [loading, setLoading] = useState(true);
    const user = authData?.user || null;
    const refreshUser = authData?.refreshUser || (() => {});
    useEffect(() => {
        const minLoadingTime = new Promise((resolve) =>
            setTimeout(resolve, 1000),
        );

        Promise.all([minLoadingTime]).then(() => {
            setLoading(false);
        });
    }, []);

    return (
        <AppBarProvider>
            {user && (
                <ChallengeTutorial user={user} refreshUser={refreshUser} />
            )}

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
            return <NotFoundPage />;
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
