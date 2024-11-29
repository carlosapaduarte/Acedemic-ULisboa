import { useEffect, useState } from "react";
import { DailyTasksProgress } from "~/service/service";
import styles from "./statistics.module.css";
import { CurWeekDate, NoDataYetAvailableMessage, SeeFullHistory } from "./Commons";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";

function ProgressIcon({ progress }: { progress: number }) {
    function getRandomInt(max: number) {
        return Math.floor(Math.random() * max);
    }

    const iconRotation = getRandomInt(90);

    const deg = progress * 3.6;

    let fillOpacity;
    let maskOpacity;
    if (progress > 50) {
        fillOpacity = "0";
        maskOpacity = "1";
    } else {
        fillOpacity = "1";
        maskOpacity = "0";
    }

    return (
        <div className={styles.wrapper} style={{ rotate: `${iconRotation}deg` }}>
            <div className={classNames(styles.pie, styles.spinner)}
                 style={{ transform: "rotate(" + deg + "deg)" }}></div>
            <div className={classNames(styles.pie, styles.filler)} style={{ opacity: fillOpacity }}></div>
            <div className={styles.mask} style={{ opacity: maskOpacity }}></div>
        </div>
    );
}

function DailyProgressStatus({ status }: { status: DailyTasksProgress }) {
    return (
        <div className={styles.textAndIconContainer}>
            <ProgressIcon progress={status.progress} />
            {status.date.getDate()} {status.date.toLocaleString("default", { month: "long" }).substring(0, 3).toUpperCase()}
        </div>
    );
}

function WeekDailyProgressStatus(
    {
        dailyProgress,
        onSeeFullHistoryClick
    }: {
        dailyProgress: DailyTasksProgress[],
        onSeeFullHistoryClick: () => void
    }
) {
    return (
        dailyProgress.length != 0 ?
            <>
                <div className={styles.historyStatusAndDate}>
                    {dailyProgress
                        .sort((status1: DailyTasksProgress, status2: DailyTasksProgress) => { // sorts by increasing year and week
                            const lower = status1.date < status2.date;
                            if (lower)
                                return -1;
                            else {
                                if (status1.date > status2.date)
                                    return 1;

                                return 0;
                            }
                        })
                        .reverse()
                        .slice(0, 6)
                        .reverse()
                        .map((value: DailyTasksProgress, index: number) =>
                            <DailyProgressStatus status={value} key={index} />
                        )
                    }
                </div>

                <br />

                <SeeFullHistory />
            </>
            :
            <NoDataYetAvailableMessage />
    );
}

function WeekProgressBar({ progress }: { progress: number }) {
    return (
        <div className={styles.progressBarBase}>
            <div className={styles.progressBar} style={{ width: progress + "%" }}>

            </div>
        </div>
    );
}

function useProgress() {
    const setError = useSetGlobalError();
    const [weekProgress, setWeekProgress] = useState(0);
    const [progressByDay, setProgressByDay] = useState<DailyTasksProgress[]>([]);

    useEffect(() => {
        const today = new Date();
        setProgressByDay([
            {
                date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                progress: 40
            },
            {
                date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
                progress: 30
            },
            {
                date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
                progress: 80
            },
            {
                date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
                progress: 25
            },
            {
                date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4),
                progress: 90
            }
        ]);
        /*
        service.getThisWeekDailyTasksProgress()
            .then((res: DailyTasksProgress[]) => {
                setProgressByDay(res)
                
                let weekProgress = 0
                res.forEach((dayProgress) => {
                    weekProgress += dayProgress.progress
                })
                weekProgress / res.length

                setWeekProgress(weekProgress)
            })
            .catch((error) => setError(error));
            */
    }, []);

    return { progressByDay, weekProgress };
}

export function Progress() {
    const { t } = useTranslation(["statistics"]);
    const { progressByDay, weekProgress } = useProgress();

    return (
        <>
            <div className={styles.statsContainer}>
                <div className={styles.statsContainerTitle}>
                    <img
                        src="icons/task_progress_icon.svg"
                        alt="Task progress icon"
                        className={styles.titleImg}
                    />
                    {t("statistics:progress_container_title")}
                </div>

                <div className={styles.WeekDateAndProgressBar}>
                    <div className={styles.weekDate}>
                        <CurWeekDate />
                    </div>
                    <WeekProgressBar progress={weekProgress} />
                </div>

                <br />

                <WeekDailyProgressStatus dailyProgress={progressByDay} onSeeFullHistoryClick={() => {
                }} />
            </div>
        </>
    );
}
