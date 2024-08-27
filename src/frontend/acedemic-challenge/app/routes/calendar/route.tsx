import { Logger } from "tslog";
import React from "react";
import { DayGoals } from "~/challenges/types";
import { UserNote } from "~/service/service";
import { MyCalendar } from "~/components/MyCalendar";
import SelectedDayGoalInfo from "~/routes/calendar/components/SelectedDayGoalInfo/SelectedDayGoalInfo";
import SelectedDayNotes from "~/routes/calendar/components/SelectedDayNotes/SelectedDayNotes";
import { useCalendar } from "~/routes/calendar/useCalendar";

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

export default function Calendar() {
    const { goals, userNotes, selectedDate, handleDateClick, onConfirmNewNoteSubmitClickHandler } = useCalendar();
    return goals == undefined || userNotes == undefined ?
        <h1>{`Loading Goals and Calendar...`}</h1>
        :
        (
            <div style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-evenly"
            }}>
                <div style={{ width: "45%" }}>
                    <MyCalendar onDayClickHandler={handleDateClick} />
                </div>
                <RightContent
                    goals={goals}
                    selectedDate={selectedDate}
                    userNotes={userNotes}
                    onConfirmNewNoteSubmitClickHandler={onConfirmNewNoteSubmitClickHandler}
                />
            </div>
        );
}