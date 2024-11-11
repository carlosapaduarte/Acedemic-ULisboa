import { useNavigate } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import styles from "./inConstructionPage.module.css";
import { Button } from "~/components/Button/Button";

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
                <Button variant={"round"} className={styles.goHomeButton}
                        onClick={() => navigate("/")
                            //startIcon={<HomeIcon/>}
                        }
                >
                    {t("in_construction_page:go_to_home")}
                </Button>
            </div>
        </div>
    );
}
