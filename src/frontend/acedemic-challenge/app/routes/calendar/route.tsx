import { Logger } from "tslog";
import React from "react";
import { DayGoals } from "~/challenges/types";
import { UserNote } from "~/service/service";
import { MyCalendar } from "~/routes/calendar/components/MyCalendar/MyCalendar";
import SelectedDayGoalInfo from "~/routes/calendar/components/SelectedDayGoalInfo/SelectedDayGoalInfo";
import { useCalendar } from "~/routes/calendar/useCalendar";
import styles from "./calendarPage.module.css";

const logger = new Logger({ name: "Calendar" });

function Goals({ goals, selectedDate, userNotes, onConfirmNewNoteSubmitClickHandler }: {
    goals: DayGoals[],
    selectedDate: Date,
    userNotes: UserNote[]
    onConfirmNewNoteSubmitClickHandler: (noteText: string) => void
}) {
    return (
        <div className={`${styles.goalsContainerWrapper}`}>
            <div className={`${styles.goalsContainer}`}>
                <SelectedDayGoalInfo goals={goals} selectedDay={selectedDate} />
                {/*<SelectedDayNotes selectedDate={selectedDate} userNotes={userNotes}
                                  onConfirmNewNoteSubmitClickHandler={onConfirmNewNoteSubmitClickHandler} />*/}
            </div>
        </div>
    );
}

function MainContent() {
    const { goals, userNotes, selectedDate, handleDateClick, onConfirmNewNoteSubmitClickHandler } = useCalendar();


    return (
        <div className={`${styles.mainContent}`}>
            {
                goals == undefined || userNotes == undefined ?
                    <h1 className={`${styles.loadingTextContainer}`}>
                        {`Loading Goals and Calendar...`}
                    </h1>
                    :
                    (
                        <>
                            <MyCalendar onDayClickHandler={handleDateClick} />
                            <Goals
                                goals={goals}
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