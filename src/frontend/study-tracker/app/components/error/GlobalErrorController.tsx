import * as React from "react";
import { useGlobalError } from "./GlobalErrorContainer";
import { useTranslation } from "react-i18next";


export function GlobalErrorController({ children }: { children: React.ReactNode }): React.ReactElement {
    const globalError = useGlobalError();
    const { t } = useTranslation(["error"]);

    if (globalError === undefined) {
        return <>{children}</>;
    } else {
        console.log("Error: " + globalError.message);
        return (
            <div style={{ padding: "1rem" }}>
                <h3>{t("error:title")}</h3>
                <h4>{globalError.message}</h4>
            </div>
        );
    }
}