import { Logger } from "tslog";
import React from "react";
import { DayChallenges } from "~/challenges/types";
import { UserNote } from "~/service/service";
import { MyCalendar } from "~/routes/calendar/components/MyCalendar/MyCalendar";
import SelectedDayChallengeInfo from "~/routes/calendar/components/SelectedDayChallengeInfo/SelectedDayChallengeInfo";
import { useCalendar } from "~/routes/calendar/useCalendar";
import styles from "./calendarPage.module.css";

const logger = new Logger({ name: "Calendar" });

function DayContent({ challenges, selectedDate, userNotes, onConfirmNewNoteSubmitClickHandler }: {
    challenges: DayChallenges[],
    selectedDate: Date,
    userNotes: UserNote[]
    onConfirmNewNoteSubmitClickHandler: (noteText: string) => void
}) {
    return (
        <div className={`${styles.challengesContainerWrapper}`}>
            <div className={`${styles.challengesContainer}`}>
                <SelectedDayChallengeInfo challenges={challenges} selectedDay={selectedDate} />
                {/*<SelectedDayNotes selectedDate={selectedDate} userNotes={userNotes}
                                  onConfirmNewNoteSubmitClickHandler={onConfirmNewNoteSubmitClickHandler} />*/}
            </div>
        </div>
    );
}

function MainContent() {
    const { challenges, userNotes, selectedDate, handleDateClick, onConfirmNewNoteSubmitClickHandler } = useCalendar();

    return (
        <div className={`${styles.mainContent}`}>
            {
                challenges == undefined || userNotes == undefined ?
                    <h1 className={`${styles.loadingTextContainer}`}>
                        {`Loading Challenges and Calendar...`}
                    </h1>
                    :
                    (
                        <>
                            <MyCalendar challenges={challenges} onDayClickHandler={handleDateClick} />
                            <DayContent
                                challenges={challenges}
                                selectedDate={selectedDate}
                                userNotes={userNotes}
                                onConfirmNewNoteSubmitClickHandler={onConfirmNewNoteSubmitClickHandler}
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