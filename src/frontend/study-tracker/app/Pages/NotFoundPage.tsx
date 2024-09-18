import { useNavigate } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import styles from "./notFoundPage.module.css";
import { Button } from "~/components/Button/Button";

/**
 * Page not found component.
 */
export function NotFoundPage() {
    const navigate = useNavigate();
    const { t } = useTranslation(["not_found_page"]);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageInnerContainer}>
                <h1>404</h1>
                <h2>
                    {t("not_found_page:title")}
                </h2>
                <h3>
                    {t("not_found_page:description")}
                </h3>
                <Button variant={"round"} className={styles.goHomeButton}
                        onClick={() => navigate("/")
                            //startIcon={<HomeIcon/>}
                        }
                >
                    {t("not_found_page:go_to_home")}
                </Button>
            </div>
        </div>
    );
}
