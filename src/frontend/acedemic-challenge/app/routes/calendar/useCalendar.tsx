import { useEffect, useState } from "react";
import { DayChallenges } from "~/challenges/types";
import { service, UserNote } from "~/service/service";
import { CalendarDay } from "~/routes/calendar/components/MyCalendar/MyCalendar";
import { useTranslation } from "react-i18next";
import { useChallenges } from "~/hooks/useChallenges";

export function useCalendar() {
    const { t } = useTranslation(["challenges"]);

    const {
        userInfo, batches, currentBatch, currentDayIndex, challenges,
        fetchUserInfo
    } = useChallenges();

    const [dayChallenges, setDayChallenges] = useState<DayChallenges[] | undefined>(undefined);
    const [userNotes, setUserNotes] = useState<UserNote[] | undefined>(undefined);

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    useEffect(() => {
        if (userInfo != undefined) {
            if (userInfo.batches.length == 0) {
                return;
            }

            setUserNotes(userInfo.userNotes);
        }
    }, [userInfo]);

    useEffect(() => {
        if (!batches || !challenges || !currentBatch || currentDayIndex == undefined)
            return;

        let dayChallenges: DayChallenges[] = [];

        batches?.forEach((batch) => {
            challenges.get(batch.id)?.forEach((dayChallengeList) => {
                const challengeDayIndex = dayChallengeList[0].challengeDay - 1;
                if (batch.id == currentBatch?.id && challengeDayIndex > currentDayIndex) {
                    return;
                }
                dayChallenges.push({
                    challenges: dayChallengeList,
                    date: new Date(batch.startDate * 1000 + 1000 * 3600 * 24 * challengeDayIndex)
                });
            });
        });

        setDayChallenges(dayChallenges);
    }, [batches, challenges]);

    const handleDateClick = (clickedDay: CalendarDay) => {
        setSelectedDate(clickedDay.date);
    };

    const onConfirmNewNoteSubmitClickHandler = (noteText: string) => {
        service.createNewUserNote(noteText, selectedDate)
            .then(() => fetchUserInfo());
    };

    return { challenges: dayChallenges, userNotes, selectedDate, handleDateClick, onConfirmNewNoteSubmitClickHandler };
}