import { NotFoundPage } from "~/Pages/NotFoundPage";
import classNames from "classnames";
import styles from "../Pages/notFoundPage.module.css";

export default function DefaultRoute() {
    return (
        <div className={classNames(styles.notFoundPage)}>
            <NotFoundPage />
        </div>
    );
}
