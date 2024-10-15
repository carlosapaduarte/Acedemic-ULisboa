import { service } from "~/service/service";
import styles from "./statistics.module.css";
import { useEffect } from "react";

function ThisWeekDate() {
    const today = new Date()
    const weekDay = today.getDay()
    const todayDate = today.getDate()

    const firstDayOfWeek = new Date(today)
    
    // Offsets date to first day of week
    firstDayOfWeek.setDate(todayDate - weekDay)
    const firstDayOfWeekDate = today.getDate()

    const lastDayOfWeek = new Date(firstDayOfWeek)

    // Offsets date to last day of week
    lastDayOfWeek.setDate(firstDayOfWeekDate + 6)

    return (
        <div className={styles.todayDate}>
            WEEK {firstDayOfWeek.getDate()} {firstDayOfWeek.toLocaleString('default', { month: 'long' }).substring(0, 3).toUpperCase()}-{lastDayOfWeek.getDate()} {lastDayOfWeek.toLocaleString('default', { month: 'long' }).substring(0, 3).toUpperCase()}
        </div>
    )
}

function ThisWeekFocusStats({} : {}) {
    return (
        <>
            <ThisWeekDate />
            <span>Total time study</span>
            <span>blablabla</span>

            <span>Average attention span</span>
            <span>blablabla</span>
        </>
    )
}

function useFocusStats() {
    useEffect(() => {
        service.getTotalTimeStudyThisWeek()
    }, [])
}

export function FocusStats() {
    return (
        <div className={styles.statsContainer}>
            <div className={styles.statTitle}>
                (O) Focus
            </div>
            <ThisWeekFocusStats />
        </div>
    )
}