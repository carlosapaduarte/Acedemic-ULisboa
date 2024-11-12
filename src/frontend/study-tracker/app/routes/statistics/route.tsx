import { useEffect, useState } from "react";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { service } from "~/service/service";
import { EnergyStats } from "./Energy";
import { FocusStats } from "./Focus";
import styles from "./statistics.module.css";
import { RequireAuthn } from "~/components/auth/RequireAuthn";
import { TaskDistribution } from "./TaskDistribution";
import { Progress } from "./Progress";
import { useTranslation } from "react-i18next";

export default function Statistics() {
    const { t } = useTranslation(["statistics"]);
    
    return (
        <RequireAuthn>
            <div className={styles.pageTitleDiv}>
                <span className={styles.pageTitle}>
                    {t("statistics:title")}
                </span>
            </div>
            <EnergyStats />
            
            <br /><br />
            
            <FocusStats />
            
            <br /><br />
            
            <TaskDistribution />

            <br /><br />
            
            <Progress />
        </RequireAuthn>
    );
}