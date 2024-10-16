import { useState } from "react";

export const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

export type WeekDayAndHour = {
    weekDay: number,
    hour: number
}

export function useWeekDayHourPicker() {
    const [weekDay, setWeekDayInternal] = useState<number | undefined>(undefined);
    const [hour, setHourInternal] = useState<number | undefined>(undefined);

    function setWeekDay(newWeekDay: number) {
        if (newWeekDay == weekDay) {
            setWeekDayInternal(undefined);
            return;
        }

        if (newWeekDay >= 0 && newWeekDay <= 6)
            setWeekDayInternal(newWeekDay);
    }

    function setHour(hour: number) {
        if (hour >= 0 && hour <= 23)
            setHourInternal(hour);
    }

    return { weekDay, hour, setWeekDay, setHour };
}