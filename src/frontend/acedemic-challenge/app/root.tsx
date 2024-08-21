import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useRouteError,
} from "@remix-run/react";
import "./tailwind.css";
import "./Translations";

import type { MetaFunction } from "@remix-run/node";
import AppDashboard from "~/AppDashboard";
import { AuthnContainer, useIsLoggedIn } from "~/components/auth/Authn";
import { NotFoundPage } from "~/Pages/NotFoundPage";

export const meta: MetaFunction = () => {
    return [
        { title: "Acedemic Challenge" },
        { name: "Acedemic Challenge", content: "Acedemic Challenge" },
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
    return (
        <AuthnContainer>
            <App />
        </AuthnContainer>
    );
}

export function App() {
    return (
        <div className="h-screen w-screen bg-primary">
            <>
                {useIsLoggedIn() ? (
                    <AppDashboard>
                        <Outlet />
                    </AppDashboard>
                ) : (
                    <Outlet />
                )}
            </>
        </div>
    );
}

export function ErrorBoundary() {
    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            return (
                <div className="h-screen w-screen bg-primary">
                    <NotFoundPage />
                </div>
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
