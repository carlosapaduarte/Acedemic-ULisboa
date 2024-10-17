import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useTimer from "react-timer-hook";
import { utils } from "~/utils";

export function Timer({ title, onMinuteElapsed, stopDate, onStopClick, onFinish }: {
    title: string,
    onMinuteElapsed: () => void
    stopDate: Date,
    onStopClick: (minutesElapsed: number) => void,
    onFinish: () => void
}) {
    const { t } = useTranslation(["study"]);

    const [startDate, setStartDate] = useState(new Date());

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

    // Just a simple variable to help to figure when to call onMinuteElapsed()
    const [count, setCount] = useState(0);

    // This should not be necessary, but, whenever argument [stopDate] changes, the counter doesn't restart, despite the change in [stopDate]
    useEffect(() => {
        restart(stopDate);
    }, [stopDate]);

    // Each minutes it passes, calls onMinuteElapsed()
    useEffect(() => {
        if (count >= 2)
            onMinuteElapsed();
        else
            setCount(count + 1);
    }, [minutes]);

    function onStopClickHandler() {
        const now = new Date();
        const minutesElapsed = utils.elapsedMinutes(now, startDate);
        setStartDate(now);
        onStopClick(minutesElapsed);
    }

    return (
        <div style={{ textAlign: "center", padding: "1rem" }}>
            <h1>{title}</h1>
            <p>
                {t("study:timer_title")}
            </p>
            <div style={{ fontSize: "4rem" }}>
                <span>{hours.toString().padStart(2, "0")}</span>:
                <span>{minutes.toString().padStart(2, "0")}</span>:
                <span>{seconds.toString().padStart(2, "0")}</span>
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
            <button onClick={onStopClickHandler}>
                {t("study:timer_stop")}
            </button>
        </div>
    );
}