import { Logger } from "tslog";
import React from "react";
import { DayGoals } from "~/challenges/types";
import { UserNote } from "~/service/service";
import { MyCalendar } from "~/routes/calendar/components/MyCalendar/MyCalendar";
import SelectedDayGoalInfo from "~/routes/calendar/components/SelectedDayGoalInfo/SelectedDayGoalInfo";
import SelectedDayNotes from "~/routes/calendar/components/SelectedDayNotes/SelectedDayNotes";
import { useCalendar } from "~/routes/calendar/useCalendar";
import styles from "./calendarPage.module.css";
import { AppBar } from "~/components/AppBar/AppBar";

const logger = new Logger({ name: "Calendar" });

function RightContent({ goals, selectedDate, userNotes, onConfirmNewNoteSubmitClickHandler }: {
    goals: DayGoals[],
    selectedDate: Date,
    userNotes: UserNote[]
    onConfirmNewNoteSubmitClickHandler: (noteText: string) => void
}) {
    return (
        <div style={{
            width: "100%",
            height: "35%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
        }}
        >
            <SelectedDayGoalInfo goals={goals} selectedDay={selectedDate} />
            <SelectedDayNotes selectedDate={selectedDate} userNotes={userNotes}
                              onConfirmNewNoteSubmitClickHandler={onConfirmNewNoteSubmitClickHandler} />
        </div>
    );
}

function MainContent() {
    const { goals, userNotes, selectedDate, handleDateClick, onConfirmNewNoteSubmitClickHandler } = useCalendar();


    return (
        <div className={`${styles.mainContent}`}>
            {
                goals == undefined || userNotes == undefined ?
                    <h1>{`Loading Goals and Calendar...`}</h1>
                    :
                    (
                        <>
                            <div>
                                <MyCalendar onDayClickHandler={handleDateClick} />
                            </div>
                            {/*<RightContent
                                goals={goals}
                                selectedDate={selectedDate}
                                userNotes={userNotes}
                                onConfirmNewNoteSubmitClickHandler={onConfirmNewNoteSubmitClickHandler}
                            />*/}
                        </>
                    )
            }
        </div>
    );
}

export default function CalendarPage() {
    return (
        <div className={`${styles.calendarPage}`}>
            <AppBar />
            <MainContent />
        </div>
    );
}