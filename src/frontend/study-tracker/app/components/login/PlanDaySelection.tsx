import { service } from "~/service/service"
import { useSetError } from "../error/ErrorContainer";
import { useState } from "react";

const weekDays = [ 
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
]

export function PlanDaySelection({onProceed} : {onProceed: () => void}) {
    const {
        weekDayInternal,
        hourInternal,
        setWeekDay,
        setHour,
        submitPlanDaySelection
    } = usePlanDaySelection(onProceed)

    return (
        <div className="flex flex-col">
            <div className="flex flex-col">
                {weekDays.map((key: string, index: number) => 
                    <div key={index}>
                        <button onClick={() => setWeekDay(index)}>
                            {key}
                        </button>
                    </div>
                )}

                <br/>

                <label>Hour</label>                
                <input type="number" min={0} max={23} onChange={(e) => setHour(Number(e.target.value))} />
                
                <br/>

                <button onClick={submitPlanDaySelection}>
                    Confirm Here!    
                </button>
            </div>
        </div>
    )

}

function usePlanDaySelection(onProceed: () => void) {
    const setError = useSetError();
    
    const [weekDayInternal, setWeekDayInternal] = useState<number | undefined>(undefined)
    const [hourInternal, setHourInternal] = useState<number | undefined>(undefined)

    function setWeekDay(weekDay: number) {
        if (weekDay >= 0 && weekDay <= 6)
            setWeekDayInternal(weekDay)
    }

    function setHour(hour: number) {
        if (hour >= 0 && hour <= 23)
            setHourInternal(hour)
    }

    function submitPlanDaySelection() {
        if (weekDayInternal == undefined)
            throw Error("Week day is not set")

        if (hourInternal == undefined)
            throw Error("Hour is not set")

        const userIdStr = localStorage["userId"]
        const userId = Number(userIdStr)
        service.updateWeekPlanningDay(userId, weekDayInternal, hourInternal)
            .then(() => onProceed())
            .catch((error) => setError(error));
    }

    return {
        weekDayInternal,
        hourInternal,
        setWeekDay,
        setHour,
        submitPlanDaySelection
    }
}