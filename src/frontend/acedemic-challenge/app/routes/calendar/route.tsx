import { Logger } from "tslog";
import React from "react";
import { BatchDay } from "~/challenges/types";
import { MyCalendar } from "~/routes/calendar/components/MyCalendar/MyCalendar";
import SelectedDayChallengeInfo from "~/routes/calendar/components/SelectedDayChallengeInfo/SelectedDayChallengeInfo";
import { useCalendar } from "~/routes/calendar/useCalendar";
import styles from "./calendarPage.module.css";
import { useTranslation } from "react-i18next";

const logger = new Logger({ name: "Calendar" });

function DayContent({ daysWithChallenges, unreachedDays, selectedDate }: {
    daysWithChallenges: BatchDay[],
    unreachedDays: BatchDay[],
    selectedDate: Date
}) {
    return (
        <div className={`${styles.challengesContainerWrapper}`}>
            <div className={`${styles.challengesContainer}`}>
                <SelectedDayChallengeInfo daysWithChallenges={daysWithChallenges}
                                          unreachedDays={unreachedDays}
                                          selectedDay={selectedDate} />
            </div>
        </div>
    );
}

function MainContent() {
    const {
        daysWithChallenges, unreachedDays, selectedDate, handleDateClick, fetchUserInfo,
        batches, currentBatch
    } = useCalendar();

    const { t } = useTranslation(["dashboard"]);

    return (
        <div className={`${styles.mainContent}`}>
            {
                daysWithChallenges == undefined || unreachedDays == undefined ?
                    <h1 className={`${styles.loadingTextContainer}`}>
                        {`Loading Challenges and Calendar...`}
                    </h1>
                    :
                    (
                        <>
                            <MyCalendar daysWithChallenges={daysWithChallenges}
                                        unreachedDays={unreachedDays}
                                        onDayClickHandler={handleDateClick} />
                            <DayContent
                                daysWithChallenges={daysWithChallenges}
                                unreachedDays={unreachedDays}
                                selectedDate={selectedDate}
                            />
                        </>
                    )
            }
        </div>
    );
}

export default function CalendarPage() {
    return (
        <div className={`${styles.calendarPage}`}>
            <MainContent />
        </div>
    );
}