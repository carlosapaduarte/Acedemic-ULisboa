import React from "react";

import styles from "./progressBar.module.css";
import { useTranslation } from "react-i18next";

export function ProgressBar({ progress }: { progress: number }) {
    const { t } = useTranslation(["common"]);
    return (
        <div className={styles.progressBarContainer}>
            <div className={styles.progressBar}>
                <div className={styles.progressBarFillContainer}>
                    <div className={styles.progressBarFill}
                         style={
                             {
                                 "--progressBarFillWidth": `${progress}%`
                             } as React.CSSProperties}>
                    </div>
                </div>
                <img src="icons/trophy_icon.svg"
                     alt={t("common:trophy")}
                     className={styles.progressBarTrophyIcon} />
            </div>
        </div>
    );
}