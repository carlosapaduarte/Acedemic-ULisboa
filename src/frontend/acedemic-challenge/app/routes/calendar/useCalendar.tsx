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

    const [daysWithChallenges, setDaysWithChallenges] = useState<BatchDay[] | undefined>(undefined);
    const [unreachedDays, setUnreachedDays] = useState<BatchDay[] | undefined>(undefined);

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    useEffect(() => {
        if (userInfo != undefined) {
            if (userInfo.batches.length == 0) {
                return;
            }
        }
    }, [userInfo]);

    useEffect(() => {
        if (!batches || !batchDays || !currentBatch || currentDayIndex == undefined)
            return;

        const daysWithChallenges: BatchDay[] = [];
        const unreachedDays: BatchDay[] = [];

        batches?.forEach((batch) => {
            batchDays.get(batch.id)?.forEach((batchDay) => {
                const newBatchDay = { ...batchDay, level: batch.level };

                if (batch.id == currentBatch?.id && batchDay.id > currentDayIndex + 1) {
                    unreachedDays.push(newBatchDay);

                    return;
                }
                daysWithChallenges.push(newBatchDay);
            });
        });

        setDaysWithChallenges(daysWithChallenges);
        setUnreachedDays(unreachedDays);
    }, [batches, batchDays]);

    const handleDateClick = (clickedDay: CalendarDay) => {
        setSelectedDate(clickedDay.date);
    };

    return { daysWithChallenges, unreachedDays, selectedDate, handleDateClick };
}