import { useNavigate } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import styles from "./inConstructionPage.module.css";
import classNames from "classnames";

/**
 * Page not found component.
 */
export function InConstructionPage() {
    const navigate = useNavigate();
    const { t } = useTranslation(["in_construction_page"]);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageInnerContainer}>
                <h2>
                    {t("in_construction_page:title")}
                </h2>
                <h3>
                    {t("in_construction_page:description")}
                </h3>
                <button className={classNames(styles.roundButton, styles.goHomeButton)}
                        onClick={() => navigate("/")
                            //startIcon={<HomeIcon/>}
                        }
                >
                    {t("in_construction_page:go_to_home")}
                </button>
            </div>
        </div>
    );
}
