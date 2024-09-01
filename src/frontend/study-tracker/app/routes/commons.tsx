import { useState } from "react"
import { useSetError } from "~/components/error/ErrorContainer"

export const weekDays = [ 
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
]

function useWeekDayAndHourPicker() {
    const [weekDay, setWeekDayInternal] = useState<number | undefined>(undefined)
    const [hour, setHourInternal] = useState<number | undefined>(undefined)

    function setWeekDay(weekDay: number) {
        if (weekDay >= 0 && weekDay <= 6)
            setWeekDayInternal(weekDay)
    }

    function setHour(hour: number) {
        if (hour >= 0 && hour <= 23)
            setHourInternal(hour)
    }

    return { weekDay, hour, setWeekDay, setHour }
}

function ConfirmButton({weekDay, hour, onConfirm} : 
    {
        weekDay: number, 
        hour: number, 
        onConfirm: (weekDayAndHour: WeekDayAndHour) => void
    }) {
    return (
        <div>
            <br/>
            <button onClick={() => onConfirm({weekDay, hour})}>
                Confirm Here!    
            </button>
        </div>
    )
}

export type WeekDayAndHour = {
    weekDay: number,
    hour: number
}

export function WeekDayAndHourPicker({onConfirm} : {onConfirm: (weekDayAndHour: WeekDayAndHour) => void}) {
    const { weekDay, hour, setWeekDay, setHour } = useWeekDayAndHourPicker()
 
    return (
        <div>
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
            

            {(weekDay && hour) ? 
                <ConfirmButton weekDay={weekDay} hour={hour} onConfirm={onConfirm} />
                :
                <></>
            }
            
        </div>
    )
}