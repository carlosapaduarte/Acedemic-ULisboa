import { useEffect, useState } from "react";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { DailyTasksProgress, service } from "~/service/service";
import styles from "./statistics.module.css";
import { CurWeekDate, SeeFullHistory } from "./Commons";

function DailyProgressStatus({ status }: { status: DailyTasksProgress }) {
    return (
        <div className={styles.textAndIconContainer}>
            <span>
                (INSERT ICON)
            </span>
            {status.date.getDate()} {status.date.toLocaleString("default", { month: "long" }).substring(0, 3).toUpperCase()}
        </div>
    );
}

function WeekDailyProgressStatus({ dailyProgress, onSeeFullHistoryClick }:
                                 {
                                    dailyProgress: DailyTasksProgress[],
                                    onSeeFullHistoryClick: () => void
                                 }) {
    return (
        <>
            <div className={styles.historyStatusAndDate}>
                {dailyProgress
                    .sort((status1: DailyTasksProgress, status2: DailyTasksProgress) => { // sorts by increasing year and week
                        const lower = status1.date < status2.date
                        if (lower)
                            return -1
                        else {
                            if (status1.date > status2.date)
                                return 1

                            return 0
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
            
            <br/>

            <SeeFullHistory />
            
        </>
    );
}

function WeekProgressBar({progress} : {progress: number}) {
    return (
        <div className={styles.progressBarBase}>
            <div className={styles.progressBar} style={{width: progress+"%"}}>
                
            </div>        
        </div>
    )
}

function useProgress() {
    const setError = useSetGlobalError();
    const [progressByDay, setProgress] = useState<DailyTasksProgress[]>([]);
    const [weekProgress, setWeekProgress] = useState(0)

    useEffect(() => {
        service.getThisWeekDailyTasksProgress()
            .then((res: DailyTasksProgress[]) => {
                setProgress(res)
                
                let weekProgress = 0
                res.forEach((dayProgress) => {
                    weekProgress += dayProgress.progress
                })
                weekProgress / res.length

                setWeekProgress(weekProgress)
            })
            .catch((error) => setError(error));
    }, []);

    return {progressByDay, weekProgress}
}

export function Progress() {
    const {progressByDay, weekProgress} = useProgress()
    
    return (
        <>
            <div className={styles.statsContainer}>
                <div className={styles.statsContainerTitle}>
                    <img 
                        src="public/icons/task_progress_icon.svg" 
                        alt="Task progress icon" 
                        className={styles.titleImg} 
                    />
                    Progress
                </div>

                <div className={styles.WeekDateAndProgressBar}>
                    <div className={styles.weekDate}>
                        <CurWeekDate />
                    </div>
                    <WeekProgressBar progress={weekProgress}/>
                </div>

                <br/>

                <WeekDailyProgressStatus  dailyProgress={progressByDay} onSeeFullHistoryClick={() => {}} />
            </div>
        </>
    );
}