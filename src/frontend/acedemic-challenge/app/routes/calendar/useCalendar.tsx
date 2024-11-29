import { useEffect, useState } from "react";
import { BatchDay } from "~/challenges/types";
import { CalendarDay } from "~/routes/calendar/components/MyCalendar/MyCalendar";
import { useTranslation } from "react-i18next";
import { useChallenges } from "~/hooks/useChallenges";

export function useCalendar() {
    const { t } = useTranslation(["challenges"]);

    const {
        userInfo, batches, currentBatch, currentDayIndex, batchDays,
        fetchUserInfo
    } = useChallenges();

    const [reachedBatchDays, setReachedBatchDays] = useState<BatchDay[] | undefined>(undefined);
    const [unreachedBatchDays, setUnreachedBatchDays] = useState<BatchDay[] | undefined>(undefined);

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    useEffect(() => {
        if (userInfo != undefined) {
            if (userInfo.batches.length == 0) {
                return;
            }
        }
    }, [userInfo]);

    useEffect(() => {
        if (batches == undefined || batchDays == undefined)
            return;

        const reachedDays: BatchDay[] = [];
        const unreachedDays: BatchDay[] = [];

        batches?.forEach((batch) => {
            batchDays.get(batch.id)?.forEach((batchDay) => {
                if (currentBatch == undefined || currentDayIndex == undefined) {
                    return;
                }

                const newBatchDay = { ...batchDay, level: batch.level };

                if (batch.id == currentBatch.id && batchDay.id > currentDayIndex + 1) {
                    unreachedDays.push(newBatchDay);

                    return;
                }
                reachedDays.push(newBatchDay);
            });
        });

        setReachedBatchDays(reachedDays);
        setUnreachedBatchDays(unreachedDays);
    }, [batches, batchDays]);

    const handleDateClick = (clickedDay: CalendarDay) => {
        setSelectedDate(clickedDay.date);
    };

    return {
        batches,
        currentBatch,
        reachedBatchDays,
        unreachedBatchDays,
        selectedDate,
        handleDateClick,
        fetchUserInfo
    };
}