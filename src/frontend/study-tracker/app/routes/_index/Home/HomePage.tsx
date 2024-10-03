import { Logger } from "tslog";
import React from "react";
import styles from "./homePage.module.css";
import { useAppBar } from "~/components/AppBar/AppBar";
import { useTranslation } from "react-i18next";

const logger = new Logger({ name: "HomePage" });

export default function HomePage() {
    const { t } = useTranslation(["home"]);
    
    useAppBar("home");

    return (
        <div className={styles.homePage}>
            <div>
                {t("home:main_question")}
            </div>
        </div>
    );
}