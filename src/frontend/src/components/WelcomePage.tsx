import React, {useState} from "react";
import {Navigate} from 'react-router-dom';
import {useIsLoggedIn} from "./auth/Authn";
import {useTranslation} from "react-i18next";
import {Box, Button, Typography} from "@mui/material";

function WelcomePage() {
    const [redirect, setRedirect] = useState<string | undefined>(undefined)
    const isLoggedIn = useIsLoggedIn()
    const {t} = useTranslation();

    const handleOnChooseLevelClick = () => {
        if (!isLoggedIn)
            setRedirect("/log-in")
        else {
            const cachedUserId = localStorage['userId'] // TODO: use cache just for now
            setRedirect(`/dashboard/${cachedUserId}`)
        }
    };

    if (redirect) {
        return <Navigate to={redirect} replace={true}/>
    } else {
        return (
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                height: '50%',
                width: '100%'
            }}>
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: '100%',
                    width: '50%'
                }}>
                    <Typography variant="h3">{t("welcome_page:title")}</Typography>
                    <Typography variant="body1">{t("welcome_page:description")}</Typography>
                    <Button onClick={handleOnChooseLevelClick}>{t("welcome_page:proceed")}</Button>
                </Box>
            </Box>
        );
    }
}

export default WelcomePage;