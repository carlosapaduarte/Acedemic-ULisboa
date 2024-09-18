import { time } from "node:console";
import React, { useEffect, useState } from "react";
import useTimer from "react-timer-hook";
import { SelectTime } from "./TimeSelection";
import { Timer } from "./Timer";

export default function TimerPage() {
    const [studyStopDate, setStudyStopDate] = useState<Date | undefined>(undefined)
    const [pauseStopDate, setPauseStopDate] = useState<Date | undefined>(undefined)

    // This is the timer that is passed to the Timer component
    const [timerStopDate, setTimerStopDate] = useState<Date | undefined>(undefined)

    function onTimeSelected(studyStopDate: Date, pauseStopDate: Date) {
        setStudyStopDate(studyStopDate)
        setPauseStopDate(pauseStopDate)

        setTimerStopDate(studyStopDate)
    }

    function onTimerFinish() {
        if (timerStopDate == studyStopDate)
            setTimerStopDate(pauseStopDate)
        else
            setTimerStopDate(undefined)
    }

    if (timerStopDate == undefined)
        return (
            <SelectTime onTimeSelected={onTimeSelected} />
        )
    else {
        const title = timerStopDate == studyStopDate ? "Study Time" : "Pause Time"
        return (
            <Timer title={title} stopDate={timerStopDate} onStopClick={() => setStudyStopDate(undefined)} onFinish={onTimerFinish} />
        );
    }
}