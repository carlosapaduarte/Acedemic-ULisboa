import { useIsLoggedIn } from "~/components/auth/Authn";
import { useNavigate } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import styles from "~/routes/_index/WelcomePage/welcomePage.module.css";
import { Button } from "~/components/Button/Button";
import classNames from "classnames";
import { AppBar } from "~/components/AppBar/AppBar";

function useWelcomePage() {
    const isLoggedIn = useIsLoggedIn();
    const navigate = useNavigate();

    const handleOnProceedClick = () => {
        if (!isLoggedIn) {
            navigate("/log-in");
        }
    };

    return { isLoggedIn, handleOnProceedClick };
}


export default function WelcomePage() {
    const { t } = useTranslation(["welcome_page"]);
    const { isLoggedIn, handleOnProceedClick } = useWelcomePage();

    if (isLoggedIn == true || isLoggedIn == undefined) {
        return null;
    }

    return (
        <div className={classNames(styles.welcomePage)}>
            <AppBar />
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
        </div>
    );
}