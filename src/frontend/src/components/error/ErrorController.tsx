import * as React from 'react'
import {Logger} from "tslog";
import {useError} from "./ErrorContainer";
import { Box, Typography } from '@mui/material';
import { t } from 'i18next';

const logger = new Logger({ name: "ErrorController" });

export function ErrorController({ children }: { children: React.ReactNode }): React.ReactElement {
    const error = useError()

    if (error === undefined) {
        return <>{children}</>
    } else {
        logger.error("Error: " + error.message)
        return (
            <Box>
                <Typography variant="h3">{t("error:title")}</Typography>
                <Typography variant="h4">{error.message}</Typography>
            </Box>
        );
    }
}