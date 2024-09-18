import { useIsLoggedIn } from "~/components/auth/Authn";
import { useNavigate } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import styles from "~/routes/_index/WelcomePage/welcomePage.module.css";
import classNames from "classnames";
import { useAppBar } from "~/components/AppBar/AppBar";

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
            <button onClick={handleOnProceedClick}>
                Go to Login
            </button>
        </div>
    );
}