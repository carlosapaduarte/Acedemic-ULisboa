import { NotFoundPage } from "~/Pages/NotFoundPage";
import classNames from "classnames";
import styles from "../Pages/notFoundPage.module.css";
import { AppBarContext } from "~/components/AppBar/AppBarProvider";
import { useIsLoggedIn } from "~/components/auth/Authn";
import { useContext, useEffect } from "react";

export let handle = {
    i18n: ["not_found_page"]
};

export default function DefaultRoute() {
    const isLoggedIn = useIsLoggedIn();
    const { setAppBarVariant } = useContext(AppBarContext);

    useEffect(() => {
        if (isLoggedIn) {
            setAppBarVariant("default");
        } else {
            setAppBarVariant("clean");
        }
    }, [isLoggedIn, setAppBarVariant]);

    return (
        <div className={classNames(styles.notFoundPage)}>
            <NotFoundPage />
        </div>
    );
}
