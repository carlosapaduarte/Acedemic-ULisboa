import { Logger } from "tslog";
import React from "react";
import { BatchDay } from "~/challenges/types";
import { MyCalendar } from "~/routes/calendar/components/MyCalendar/MyCalendar";
import SelectedDayChallengeInfo from "~/routes/calendar/components/SelectedDayChallengeInfo/SelectedDayChallengeInfo";
import { useCalendar } from "~/routes/calendar/useCalendar";
import styles from "./calendarPage.module.css";

const logger = new Logger({ name: "Calendar" });

function DayContent({ daysWithChallenges, selectedDate }: {
    daysWithChallenges: BatchDay[],
    selectedDate: Date
}) {
    return (
        <div className={`${styles.challengesContainerWrapper}`}>
            <div className={`${styles.challengesContainer}`}>
                <SelectedDayChallengeInfo daysWithChallenges={daysWithChallenges} selectedDay={selectedDate} />
            </div>
        </div>
    );
}

function MainContent() {
    const { daysWithChallenges, unreachedDays, selectedDate, handleDateClick } = useCalendar();

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