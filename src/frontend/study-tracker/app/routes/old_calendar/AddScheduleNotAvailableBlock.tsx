import { useState } from "react";
import { WeekDayHourPicker } from "~/components/WeekDayHourPicker/WeekDayHourPicker";
import { WeekDayAndHour } from "~/hooks/useWeekDayHourPicker/useWeekDayHourPicker";
import { service } from "~/service/service";

function useAddScheduleNotAvailableBlock() {
    const [weekDayAndHour, setWeekDayAndHour] = useState<WeekDayAndHour | undefined>(undefined);
    const [duration, setDuration] = useState<number | undefined>(undefined);

    function clearValues() {
        setWeekDayAndHour(undefined);
        setDuration(undefined);
    }

    function createNotAvailableBlock(weekDayAndHour: WeekDayAndHour, duration: number) {
        service.createScheduleNotAvailableBlock({
            weekDay: weekDayAndHour.weekDay,
            startHour: weekDayAndHour.hour,
            duration
        });
    }

    function createNotAvailableBlockAndClearValues(weekDayAndHour: WeekDayAndHour, duration: number) {
        createNotAvailableBlock(weekDayAndHour, duration);
        clearValues();
    }

    return {
        weekDayAndHour,
        setWeekDayAndHour,
        duration,
        setDuration,
        createNotAvailableBlockAndClearValues
    };
}

function DurationPicker({ onDurationChange }: { onDurationChange: (newDuration: number) => void }) {
    return (
        <div>
            <label>Duration</label>
            <input type="number" id="quantity" name="quantity" min="1"
                   onChange={(e) => onDurationChange(Number(e.target.value))}></input>
        </div>
    );
}

export function AddScheduleNotAvailableBlock() {
    const {
        weekDayAndHour,
        setWeekDayAndHour,
        duration,
        setDuration,
        createNotAvailableBlockAndClearValues
    } = useAddScheduleNotAvailableBlock();

    return (
        <div>
            <WeekDayHourPicker onConfirm={setWeekDayAndHour} />
            <DurationPicker onDurationChange={setDuration} />
            {weekDayAndHour && duration ?
                <button onClick={() => createNotAvailableBlockAndClearValues(weekDayAndHour, duration)}>
                    Confirm
                </button>
                :
                <></>
            }

        </div>
    );
}