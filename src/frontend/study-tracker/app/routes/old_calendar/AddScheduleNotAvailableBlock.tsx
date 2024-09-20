import { ChangeEvent, useState } from "react"
import { toInputDateValueStr } from "./commons"
import { service } from "~/service/service"
import { useSetError } from "~/components/error/ErrorContainer"
import { utils } from "~/utils"
import { WeekDayAndHour, WeekDayAndHourPicker } from "../commons"

function useAddScheduleNotAvailableBlock() {
    const [weekDayAndHour, setWeekDayAndHour] = useState<WeekDayAndHour | undefined>(undefined)
    const [duration, setDuration] = useState<number | undefined>(undefined)

    function clearValues() {
        setWeekDayAndHour(undefined)
        setDuration(undefined)
    }

    function createNotAvailableBlock(weekDayAndHour: WeekDayAndHour, duration: number) {
        const userId = utils.getUserId()
        service.createScheduleNotAvailableBlock(userId, { 
            weekDay: weekDayAndHour.weekDay, 
            startHour: weekDayAndHour.hour, 
            duration
        })
    }

    function createNotAvailableBlockAndClearValues(weekDayAndHour: WeekDayAndHour, duration: number) {
        createNotAvailableBlock(weekDayAndHour, duration)
        clearValues()
    }

    return {
        weekDayAndHour,
        setWeekDayAndHour,
        duration,
        setDuration,
        createNotAvailableBlockAndClearValues
    }
}

function DurationPicker({onDurationChange} : {onDurationChange: (newDuration: number) => void}) {
    return (
        <div>
            <label>Duration</label>
            <input type="number" id="quantity" name="quantity" min="1" onChange={(e) => onDurationChange(Number(e.target.value))}></input>
        </div>
    )
}

export function AddScheduleNotAvailableBlock() {
    const {
        weekDayAndHour,
        setWeekDayAndHour,
        duration,
        setDuration,
        createNotAvailableBlockAndClearValues
    } = useAddScheduleNotAvailableBlock()

	return (
		<div>
            <WeekDayAndHourPicker onConfirm={setWeekDayAndHour} />
            <DurationPicker onDurationChange={setDuration} />
            {weekDayAndHour && duration ?
                <button onClick={() => createNotAvailableBlockAndClearValues(weekDayAndHour, duration)}>
                    Confirm
                </button>
                :
                <></>
            }
            
        </div>
	)
}