import { Box, Typography } from "@mui/material";
import { t } from "i18next";

function ErrorViewer({error} : {error: string}) {
    return (
        <Box>
            <Typography variant="h3">{t("error:title")}</Typography>
            <Typography variant="h3"></Typography>
        </Box>
    )
}