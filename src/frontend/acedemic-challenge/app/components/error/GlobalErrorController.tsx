import * as React from "react";
import { useGlobalError, useSetGlobalError } from "./GlobalErrorContainer";
import { useTranslation } from "react-i18next";
import { NotAuthorizedError } from "~/service/error";
import { useLogOut } from "../auth/Authn";


export function GlobalErrorController({ children }: { children: React.ReactNode }): React.ReactElement {
    const { t } = useTranslation(["error"]);

    const globalError = useGlobalError();
    const setGlobalError = useSetGlobalError();

    const logout = useLogOut();

    // If the error is because of authentication issues, delete local authentication information.
    // NotAuthorizedError is an error that is thrown by the fetch function, when token is invalid.
    if (globalError instanceof NotAuthorizedError) {
        logout();
        setGlobalError(undefined);
    }

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