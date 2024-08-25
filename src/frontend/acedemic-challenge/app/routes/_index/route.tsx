import { useTranslation } from "react-i18next";
import { useIsLoggedIn, useSetIsLoggedIn } from "~/components/auth/Authn";
import { useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import styles from "./index.module.css";
import { Button } from "~/components/Button";

export default function WelcomePage() {
    const { t } = useTranslation();
    const { handleOnProceedClick } = useWelcomePage();

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageInnerContainer}>
                <h1>
                    {t("welcome_page:title")}
                </h1>
                <p>
                    {t("welcome_page:description")}
                </p>
                <Button variant={"round"} className={styles.proceedButton} onClick={handleOnProceedClick}>
                    {t("welcome_page:proceed")}
                </Button>
            </div>
        </div>
    );
}

function useWelcomePage() {
    const isLoggedIn = useIsLoggedIn();
    const setLoggedIn = useSetIsLoggedIn();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) {
            if (localStorage["userId"]) {
                const cachedUserId = localStorage["userId"]; // TODO: use cache just for now
                navigate(`/dashboard/${cachedUserId}`);
            } else {
                setLoggedIn(false);
            }
        }
    }, []);

    const handleOnProceedClick = () => {
        if (!isLoggedIn) {
            navigate("/log-in");
        }
    };

    return { handleOnProceedClick };
}
