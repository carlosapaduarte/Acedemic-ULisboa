import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import useTimer from "react-timer-hook"

export function Timer({ title, stopDate, onStopClick, onFinish } : { 
    title: string, 
    stopDate: Date, 
    onStopClick: () => void, 
    onFinish: () => void 
}) {
    const { t } = useTranslation(["study"]);
    
    const {
        totalSeconds,
        seconds,
        minutes,
        hours,
        days,
        isRunning,
        start,
        pause,
        resume,
        restart
    } = // @ts-ignore
        useTimer({ expiryTimestamp: stopDate, onExpire: onFinish });
            
    // This should not be necessary, but, whenever argument [stopDate] changes, the counter doesn't restart, despite the change in [stopDate]
    useEffect(() => {
        restart(stopDate)
    }, [stopDate])

    return (
        <div style={{ textAlign: "center", padding: "1rem" }}>
            <h1>{title}</h1>
            <p>
                {t("study:timer_title")}
            </p>
            <div style={{ fontSize: "4rem" }}>
                <span>{hours.toString().padStart(2, '0')}</span>:
                <span>{minutes.toString().padStart(2, '0')}</span>:
                <span>{seconds.toString().padStart(2, '0')}</span>
            </div>
            <p>{isRunning ? "Running" : "Not running"}</p>
            <button onClick={start}>
                {t("study:timer_start")}
            </button>
            <button onClick={pause}>
                {t("study:timer_pause")}
            </button>
            <button onClick={resume}>
                {t("study:timer_resume")}
            </button>
            <button onClick={onStopClick}>
                {t("study:timer_stop")}
            </button>
        </div>
    );
}