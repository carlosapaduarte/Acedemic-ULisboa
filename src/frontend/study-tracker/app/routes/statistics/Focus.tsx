import { service, WeekTimeStudy } from "~/service/service";
import styles from "./statistics.module.css";
import React, { useEffect, useState } from "react";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { utils } from "~/utils";
import { SeeFullHistory, Spacer } from "./Commons";

function getWeekIntervalStr(date: Date): string {
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

function BarChart({weekStudyTimeHistory} : {weekStudyTimeHistory: WeekTimeStudy[]}) {
    return (
        <div className={styles.focusWeeksContainer}>
            {
                weekStudyTimeHistory
                .sort((week1: WeekTimeStudy, week2: WeekTimeStudy) => { // sorts by increasing year and week
                    const year1 = week1.week
                    const year2 = week2.week

                    if (year1 < year2)
                        return -1

                    if (year1 > year2)
                        return 1

                    return week1.week - week2.week

                })
                    .reverse() // higher weeks first
                    .slice(0, 3) // Selects the three first weeks
                    .reverse() // lower weeks first
                    .map((weekData, index) => {
                        const date = utils.getDateFromWeekNumber(weekData.year, weekData.week)
                        const weekStudyTimeTarget = weekData.target
                        let percentageFocusDone = weekData.total / weekStudyTimeTarget * 100
                        
                        // To avoid bar overflow
                        if (percentageFocusDone > 100)
                            percentageFocusDone = 100
                        
                        return (
                            <div key={index} className={styles.focusWeekContainer}>
                                <div className={styles.focusWeekLabel}>
                                    <span className={styles.containerHeaderDate}>
                                        {getWeekIntervalStr(date)}
                                    </span>
                                </div>
                                <div className={styles.focusWeekProgressBarContainer}>
                                    <div className={styles.focusWeekProgressBar}
                                        style={{ "--bar-width": `${percentageFocusDone}%` } as React.CSSProperties}>
                                    </div>
                                </div>
                            </div>
                        )
                    })
            }
        </div>
    )
}


function HistoryStats({weekStudyTimeHistory} : {weekStudyTimeHistory: WeekTimeStudy[]}) {
    return (
        <>
            <div className={styles.historyTitleAndSeeMore}>
                <span className={styles.historyTitle}>
                    History
                </span>
                <SeeFullHistory />
            </div>

            <div>
                <BarChart weekStudyTimeHistory={weekStudyTimeHistory}/>
            </div>
        </>
    )
}

function CurWeekDate() {
    return (
        <span className={styles.containerHeaderDate}>
            WEEK {getWeekIntervalStr(new Date())}
        </span>
    );
}

function CurWeekFocusStats({weekStats} : {weekStats: WeekTimeStudy}) {
    function toHoursAndMinutesStr(totalMinutes: number): string {
        const hours = Math.trunc(totalMinutes / 60);
        const minutes = totalMinutes - hours * 60;
        return `${hours} hours and ${minutes} minutes`;
    }

    return (
        <>
            <span className={styles.focusContainerCurWeekStatisticTitle}>Total time study</span>
            <br />
            <span className={styles.focusContainerCurWeekStatisticValue}>{toHoursAndMinutesStr(weekStats.total)}</span>

            <Spacer />

            <span className={styles.focusContainerCurWeekStatisticTitle}>Average attention span</span>
            <br />
            <span className={styles.focusContainerCurWeekStatisticValue}>{weekStats.averageBySession} minutes</span>

            <Spacer />
        </>
    );
}

function useFocusStats() {
    const setError = useSetGlobalError();
    const [weekStudyTimeHistory, setWeekStudyTimeHistory] = useState<WeekTimeStudy[] | undefined>(undefined);

    useEffect(() => {
        service.getStudyTimeByWeek()
            .then((res) => setWeekStudyTimeHistory(res))
            .catch((error) => setError(error));
    }, []);

    function getCurrentWeekStudyTime(): WeekTimeStudy | undefined {
        const today = new Date();
        const currentWeekNumber = utils.getWeekNumber(today);
        return weekStudyTimeHistory?.find((value: WeekTimeStudy) =>
            value.year == today.getFullYear() && value.week == currentWeekNumber
        );
    }

    return { weekStudyTimeHistory, getCurrentWeekStudyTime };
}

export function FocusStats() {
    const { weekStudyTimeHistory, getCurrentWeekStudyTime } = useFocusStats();
    const curWeekStats = getCurrentWeekStudyTime();

    return (
        <div className={styles.statsContainer}>
            <div className={styles.statsContainerTitleAndDateDiv}>
                <div className={styles.statsContainerTitle}>
                    (O) Focus
                </div>
                <CurWeekDate />
            </div>

            {curWeekStats ?
                <CurWeekFocusStats weekStats={curWeekStats} />
                :
                <></>
            }

            {weekStudyTimeHistory ?
                <HistoryStats weekStudyTimeHistory={weekStudyTimeHistory}/>
                :
                <></>
            }

            
        </div>
    );
}