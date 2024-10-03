import * as React from "react";
import { Logger } from "tslog";
import { useError, useSetError } from "./ErrorContainer";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useLogOut } from "../auth/Authn";
import { NotAuthorizedError } from "~/service/error";

const logger = new Logger({ name: "ErrorController" });

export function ErrorController({ children }: { children: React.ReactNode }): React.ReactElement {
    const { t } = useTranslation(["error"]);
    
    const error = useError();
    const setError = useSetError();

    const logout = useLogOut()

    // If the error is because of authentication issues, delete local authentication information.
    // NotAuthorizedError is an error that is thrown by the fetch function, when token is invalid.
    if (error instanceof NotAuthorizedError) {
        logout()
        setError(undefined)
    }

    if (error === undefined) {
        return <>{children}</>;
    } else {
        logger.error("Error: " + error.message);
        return (
            <Box>
                <Typography variant="h3">{t("error:title")}</Typography>
                <Typography variant="h4">{error.message}</Typography>
            </Box>
        );
    }
}