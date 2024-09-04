import * as React from "react";
import { useError } from "./ErrorContainer";
import { useTranslation } from "react-i18next";


export function ErrorController({ children }: { children: React.ReactNode }): React.ReactElement {
    const error = useError();
    const { t } = useTranslation(["error"]);

    if (error === undefined) {
        return <>{children}</>;
    } else {
        console.log("Error: " + error.message);
        return (
            <div>
                <h3>{t("error:title")}</h3>
                <h4>{error.message}</h4>
            </div>
        );
    }
}