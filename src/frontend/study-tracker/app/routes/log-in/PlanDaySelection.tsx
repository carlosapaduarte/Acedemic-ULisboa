import { service } from "~/service/service"
import { useState } from "react";
import { useSetError } from "~/components/error/ErrorContainer";
import { WeekDayAndHour, WeekDayAndHourPicker, weekDays } from "../commons";

export function PlanDaySelection({onProceed} : {onProceed: () => void}) {
    const { submitPlanDaySelection } = usePlanDaySelection(onProceed)

    function onDayPlanDateConfirm(info: WeekDayAndHour) {
        submitPlanDaySelection(info.weekDay, info.hour)
    }

    return (
        <WeekDayAndHourPicker onConfirm={onDayPlanDateConfirm} />
    )

}

function usePlanDaySelection(onProceed: () => void) {
    const setError = useSetError();

    function submitPlanDaySelection(weekDay: number, hour: number) {
        const userIdStr = localStorage["userId"]
        const userId = Number(userIdStr)
        service.updateWeekPlanningDay(userId, weekDay, hour)
            .then(() => onProceed())
            .catch((error) => setError(error));
    }

    return { submitPlanDaySelection }
}