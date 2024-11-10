import { useEffect, useState } from "react";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { DailyTasksProgress, service } from "~/service/service";
import styles from "./statistics.module.css";
import { CurWeekDate } from "./Commons";

function ProgressBar({progress} : {progress: number}) {
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
                    (O) Progress
                </div>

                <div className={styles.WeekDateAndProgressBar}>
                    <div className={styles.weekDate}>
                        <CurWeekDate />
                    </div>
                    <ProgressBar progress={weekProgress}/>
                </div>
            </div>
        </>
    );
}