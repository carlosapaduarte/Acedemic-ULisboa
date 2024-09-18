import { useEffect } from "react";
import useTimer from "react-timer-hook"

export function Timer({ title, stopDate, onStopClick, onFinish } : { 
    title: string, 
    stopDate: Date, 
    onStopClick: () => void, 
    onFinish: () => void 
}) {
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
            <p>Timer Demo</p>
            <div style={{ fontSize: "4rem" }}>
                <span>{hours.toString().padStart(2, '0')}</span>:
                <span>{minutes.toString().padStart(2, '0')}</span>:
                <span>{seconds.toString().padStart(2, '0')}</span>
            </div>
            <p>{isRunning ? "Running" : "Not running"}</p>
            <button onClick={start}>Start</button>
            <button onClick={pause}>Pause</button>
            <button onClick={resume}>Resume</button>
            <button onClick={onStopClick}>Stop</button>
        </div>
    );
}