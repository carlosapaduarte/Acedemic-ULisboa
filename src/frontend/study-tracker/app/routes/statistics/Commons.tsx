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
            <img src="icons/history_icon.svg" alt={t("statistics:history_icon_alt")} className={styles.historyIcon} />
            {t("statistics:see_full_history")}
        </button>
    );
}

export function getWeekIntervalStr(date: Date, locale: string): string {
    const weekDay = date.getDay();
    const today = date.getDate();

    const firstDayOfWeek = new Date(date);

    // Offsets date to first day of week
    firstDayOfWeek.setDate(today - weekDay + 1); // Monday is 1
    const firstDayOfWeekDate = firstDayOfWeek.getDate();

    const lastDayOfWeek = new Date(firstDayOfWeek);

    // Offsets date to last day of week
    lastDayOfWeek.setDate(firstDayOfWeekDate + 6);

    const monthLabel = (value: Date) =>
        new Intl.DateTimeFormat(locale, { month: "short" })
            .format(value)
            .replace(".", "")
            .toUpperCase();
    return `${firstDayOfWeek.getDate()} ${monthLabel(firstDayOfWeek)}-${lastDayOfWeek.getDate()} ${monthLabel(lastDayOfWeek)}`;
}

export function CurWeekDate() {
    const { t, i18n } = useTranslation(["statistics"]);
    const locale = i18n.resolvedLanguage?.toLowerCase().startsWith("en") ? "en-GB" : "pt-PT";
    return (
        <span className={styles.containerHeaderDate}>
            {t("statistics:week")} {getWeekIntervalStr(new Date(), locale)}
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
