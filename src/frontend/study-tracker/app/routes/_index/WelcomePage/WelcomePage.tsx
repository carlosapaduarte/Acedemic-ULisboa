import { useIsLoggedIn } from "~/components/auth/Authn";
import { useNavigate } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import styles from "~/routes/_index/WelcomePage/welcomePage.module.css";
import classNames from "classnames";
import { useAppBar } from "~/components/AppBar/AppBarProvider";

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
    useAppBar("clean");

    const { t } = useTranslation(["welcome_page"]);
    const { isLoggedIn, handleOnProceedClick } = useWelcomePage();

    if (isLoggedIn == true || isLoggedIn == undefined) {
        return null;
    }

    return (
        <div className={classNames(styles.welcomePage)}>
            <h1>
                {t("welcome_page:hello_message")}
                <br /> 
                {t("welcome_page:login_to_continue")}
            </h1>
            <br />
            <button className={styles.roundButton} onClick={handleOnProceedClick}>
                {t("welcome_page:login")}
            </button>
        </div>
    );
}