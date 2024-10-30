import styles from "./statistics.module.css";

export function Spacer() {
    return (
        <div className={styles.spacer}>

        </div>
    )
}

export function SeeFullHistory() {
    return (
        <button className={styles.seeFullHistoryButton}>
            <img src="/icons/history_icon.svg" alt="History Icon" className={styles.historyIcon}/>
            See full history
        </button>
    )
}

export function getWeekIntervalStr(date: Date): string {
    const weekDay = date.getDay();
    const todayDate = date.getDate();

    const firstDayOfWeek = new Date(date);

    // Offsets date to first day of week
    firstDayOfWeek.setDate(todayDate - weekDay + 1); // Monday is 1
    const firstDayOfWeekDate = date.getDate();

    const lastDayOfWeek = new Date(firstDayOfWeek);

    // Offsets date to last day of week
    lastDayOfWeek.setDate(firstDayOfWeekDate + 6);

    return `${firstDayOfWeek.getDate()} ${firstDayOfWeek.toLocaleString('default', { month: 'long' }).substring(0, 3).toUpperCase()}-${lastDayOfWeek.getDate()} ${lastDayOfWeek.toLocaleString('default', { month: 'long' }).substring(0, 3).toUpperCase()}`
}

export function CurWeekDate() {
    return (
        <span className={styles.containerHeaderDate}>
            WEEK {getWeekIntervalStr(new Date())}
        </span>
    );
}