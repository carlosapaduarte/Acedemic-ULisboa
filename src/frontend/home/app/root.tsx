import { json, Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";

import "global.css";
import { Footer } from "~/components/Footer/Footer";
import i18next from "~/i18next.server";
import { useTranslation } from "react-i18next";
import { useChangeLanguage } from "remix-i18next/react";

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
    i18n: ["common"]
};

// @ts-ignore
export const meta: MetaFunction = ({ data }: { data: { locale: string, metaDescription: string } }) => {
    return [
        { title: "Acedemic Home" },
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
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <Meta />
            <Links />
            <title>Acedemic Home</title>
        </head>
        <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        </body>
        </html>
    );
}

export default function App() {
    return <div className="app">
        <Outlet />
        <Footer />
    </div>;
}
