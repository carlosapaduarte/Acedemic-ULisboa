import {Box, Button, Typography} from "@mui/material";
import {useNavigate} from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import {useTranslation} from "react-i18next";


/**
 * Page not found component.
 */
export function NotFoundPage() {
    const navigate = useNavigate()
    const { t } = useTranslation()

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            width: '100%'
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: '100%',
                width: '50%'
            }}>
                <Typography variant="h1" component="h1" sx={{fontSize: 200, fontWeight: 700}}>
                    404
                </Typography>

                <Typography variant="h2" component="h2" gutterBottom>
                    {t("not_found_page:title")}
                </Typography>

                <Typography variant="body1" gutterBottom>
                    {t("not_found_page:description")}
                </Typography>

                <Button
                    variant="contained"
                    startIcon={<HomeIcon/>}
                    onClick={() => navigate("/")}
                    sx={{width: "50%"}}
                >
                    {t("not_found_page:go_to_home")}
                </Button>
            </Box>
            {/*<Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    width: '50%'
                }}
            >
                <img src={Logo} alt="Logo" width="40%"/>
            </Box>*/}
        </Box>
    )
}