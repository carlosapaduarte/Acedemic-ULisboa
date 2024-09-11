import { NotFoundPage } from "~/Pages/NotFoundPage";
import classNames from "classnames";
import styles from "../Pages/notFoundPage.module.css";
import { AppBar } from "~/components/AppBar/AppBar";

export default function DefaultRoute() {
    return (
        <div className={classNames(styles.notFoundPage)}>
            <AppBar />
            <NotFoundPage />
        </div>
    );
}
