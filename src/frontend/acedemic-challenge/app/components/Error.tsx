import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

function ErrorViewer({ error }: { error: string }) {
    const { t } = useTranslation(["error"]);

    return (
        <Box>
            <Typography variant="h3">{t("error:title")}</Typography>
            <Typography variant="h3"></Typography>
        </Box>
    );
}