import { service, WeekTimeStudy } from "~/service/service";
import styles from "./statistics.module.css";
import React, { useEffect, useState } from "react";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { utils } from "~/utils";

function ThisWeekDate() {
    const today = new Date();
    const weekDay = today.getDay();
    const todayDate = today.getDate();

    const firstDayOfWeek = new Date(today);

    // Offsets date to first day of week
    firstDayOfWeek.setDate(todayDate - weekDay);
    const firstDayOfWeekDate = today.getDate();

    const lastDayOfWeek = new Date(firstDayOfWeek);

    // Offsets date to last day of week
    lastDayOfWeek.setDate(firstDayOfWeekDate + 6);

    return (
        <div className={styles.todayDate}>
            WEEK {firstDayOfWeek.getDate()} {firstDayOfWeek.toLocaleString("default", { month: "long" }).substring(0, 3).toUpperCase()}-{lastDayOfWeek.getDate()} {lastDayOfWeek.toLocaleString("default", { month: "long" }).substring(0, 3).toUpperCase()}
        </div>
    );
}

function ThisWeekFocusStats({ weekStats }: { weekStats: WeekTimeStudy }) {
    function toHoursAndMinutesStr(totalMinutes: number): string {
        const hours = Math.trunc(totalMinutes / 60);
        const minutes = totalMinutes - hours * 60;
        return `${hours} hours and ${minutes} minutes`;
    }

    return (
        <>
            <ThisWeekDate />
            <span className={styles.focusContainerCurWeekStatisticTitle}>Total time study</span>
            <br /><br />
            <span className={styles.focusContainerCurWeekStatisticValue}>{toHoursAndMinutesStr(weekStats.total)}</span>

            <br /><br />

            <span className={styles.focusContainerCurWeekStatisticTitle}>Average attention span</span>
            <br /><br />
            <span className={styles.focusContainerCurWeekStatisticValue}>{weekStats.averageBySession} minutes</span>
        </>
    );
}

function useFocusStats() {
    const setError = useSetGlobalError();
    const [studyTimeByWeek, setStudyTimeByWeek] = useState<WeekTimeStudy[] | undefined>(undefined);

    useEffect(() => {
        service.getStudyTimeByWeek()
            .then((res) => setStudyTimeByWeek(res))
            .catch((error) => setError(error));
    }, []);

    function getCurrentWeekStudyTime(): WeekTimeStudy | undefined {
        const today = new Date();
        const currentWeekNumber = utils.getWeekNumber(today);
        return studyTimeByWeek?.find((value: WeekTimeStudy) =>
            value.year == today.getFullYear() && value.week == currentWeekNumber
        );
    }

    return { studyTimeByWeek, getCurrentWeekStudyTime };
}

export function FocusStats() {
    const { studyTimeByWeek, getCurrentWeekStudyTime } = useFocusStats();

    const curWeekStats = getCurrentWeekStudyTime();

    const maxHours = 200;

    const barData = [
        {
            "name": "week1",
            "hours": 120
        },
        {
            "name": "week2",
            "hours": 70
        },
        {
            "name": "week3",
            "hours": 160
        }
    ];

    return (
        <div className={styles.statsContainer}>
            <div className={styles.statsContainerTitle}>
                (O) Focus
            </div>
            <div className={styles.focusWeeksContainer}>
                {
                    barData.map(weekData =>
                        <div className={styles.focusWeekContainer}>
                            <div className={styles.focusWeekLabel}>
                                {weekData.name}
                            </div>
                            <div className={styles.focusWeekProgressBarContainer}>
                                <div className={styles.focusWeekProgressBar}
                                     style={{ "--bar-width": `${weekData.hours / maxHours * 100}%` } as React.CSSProperties}>
                                </div>
                            </div>
                        </div>)
                }
            </div>
            {/*{curWeekStats ?
                <ThisWeekFocusStats weekStats={curWeekStats} />
                :
                <></>
            }*/}
        </div>
    );
}