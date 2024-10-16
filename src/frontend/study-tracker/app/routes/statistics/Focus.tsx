import { service, WeekTimeStudy } from "~/service/service";
import styles from "./statistics.module.css";
import { useEffect, useState } from "react";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { utils } from "~/utils";

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

function ThisWeekFocusStats({weekStats} : {weekStats: WeekTimeStudy}) {
    function toHoursAndMinutesStr(totalMinutes: number): string {
        const hours = Math.trunc(totalMinutes / 60)
        const minutes = totalMinutes - hours * 60
        return `${hours} hours and ${minutes} minutes`
    }

    return (
        <>
            <ThisWeekDate />
            <span className={styles.focusContainerCurWeekStatisticTitle}>Total time study</span>
            <br/><br/>
            <span className={styles.focusContainerCurWeekStatisticValue}>{toHoursAndMinutesStr(weekStats.minutes)}</span>

            <br/><br/>

            <span className={styles.focusContainerCurWeekStatisticTitle}>Average attention span</span>
            <br/><br/>
            <span className={styles.focusContainerCurWeekStatisticValue}>blablabla</span>
        </>
    )
}

function useFocusStats() {
    const setError = useSetGlobalError();
    const [studyTimeByWeek, setStudyTimeByWeek] = useState<WeekTimeStudy[] | undefined>(undefined)
    
    useEffect(() => {
        service.getStudyTimeByWeek()
            .then((res) => setStudyTimeByWeek(res))
            .catch((error) => setError(error));
    }, [])

    function getCurrentWeekStudyTime(): WeekTimeStudy | undefined {
        const today = new Date()
        const currentWeekNumber = utils.getWeekNumber(today)
        return studyTimeByWeek?.find((value: WeekTimeStudy) => 
            value.year == today.getFullYear() && value.week == currentWeekNumber
        )
    }

    return {studyTimeByWeek, getCurrentWeekStudyTime}
}

export function FocusStats() {
    const {studyTimeByWeek, getCurrentWeekStudyTime} = useFocusStats()

    const curWeekStats = getCurrentWeekStudyTime()

    return (
        <div className={styles.statsContainer}>
            <div className={styles.statsContainerTitle}>
                (O) Focus
            </div>
            {curWeekStats ?
                <ThisWeekFocusStats weekStats={curWeekStats} />
                :
                <></>
            }
        </div>
    )
}