import { useTranslation } from "react-i18next";
import styles from "./statistics.module.css";

export function Spacer() {
    return (
        <div className={styles.spacer} />
    );
}

export function SeeFullHistory() {
    const { t } = useTranslation(["statistics"]);
    return (
        <button className={styles.seeFullHistoryButton}>
            <img src="icons/history_icon.svg" alt="History Icon" className={styles.historyIcon} />
            {t("statistics:see_full_history")}
        </button>
    );
}

export function getWeekIntervalStr(date: Date): string {
    const weekDay = date.getDay();
    const today = date.getDate();

    const firstDayOfWeek = new Date(date);

    // Offsets date to first day of week
    firstDayOfWeek.setDate(today - weekDay + 1); // Monday is 1
    const firstDayOfWeekDate = firstDayOfWeek.getDate();

    const lastDayOfWeek = new Date(firstDayOfWeek);

    // Offsets date to last day of week
    lastDayOfWeek.setDate(firstDayOfWeekDate + 6);

    return `${firstDayOfWeek.getDate()} ${firstDayOfWeek.toLocaleString("default", { month: "long" }).substring(0, 3).toUpperCase()}-${lastDayOfWeek.getDate()} ${lastDayOfWeek.toLocaleString("default", { month: "long" }).substring(0, 3).toUpperCase()}`;
}

export function CurWeekDate() {
    const { t } = useTranslation(["statistics"]);
    return (
        <span className={styles.containerHeaderDate}>
            {t("statistics:week")} {getWeekIntervalStr(new Date())}
        </span>
    );
}

export function NoDataYetAvailableMessage() {
    const { t } = useTranslation(["statistics"]);
    return (
        <div className={styles.noDataAvailableMessage}>
            {t("statistics:no_data_available_yet")}
        </div>
    );
}