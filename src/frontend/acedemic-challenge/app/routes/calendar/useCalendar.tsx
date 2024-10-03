import { useSetError } from "~/components/error/ErrorContainer";
import { useEffect, useState } from "react";
import { DayGoals, Goal } from "~/challenges/types";
import { service, UserInfo, UserNote } from "~/service/service";
import { utils } from "~/utils";
import { CalendarDay } from "~/routes/calendar/components/MyCalendar/MyCalendar";

export function useCalendar() {
    const setError = useSetError();

    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [goals, setGoals] = useState<DayGoals[] | undefined>(undefined);
    const [userNotes, setUserNotes] = useState<UserNote[] | undefined>(undefined);

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    type FullCalendarEventsType = {
        title: String,
        date: String
    }

    async function fetchUserCurrentDayAndLoadGoals() {
        try {
            const userInfo: UserInfo = await service.fetchUserInfoFromApi();

            // For simplification, use the first one
            const batchToDisplay = userInfo.batches[0]
            const level = batchToDisplay.level
            const startDate = new Date(2024, 7, 10, 12, 22, 22, 22)
            //const startDate = new Date(batchToDisplay.startDate * 1000) // Feel free to change for testing
            const userGoals = utils.getUserGoals(level, startDate)

            //console.log("User Goals: ", userGoals)

            console.log("User goals: ", userGoals, "Start date: ", startDate, "User notes ", userInfo.userNotes);

            setStartDate(startDate);
            setGoals(userGoals);
            setUserNotes(userInfo.userNotes);
        } catch (error: any) {
            setError(error);
        }
    }

    useEffect(() => {
        fetchUserCurrentDayAndLoadGoals();
    }, []);

    // Builds an object to display events in FullCalendar
    function buildEvents(goals: DayGoals[], userGoals: UserNote[]): any {

       /* function buildDayEvents(date: Date, goals: Goal[]): FullCalendarEventsType[] {
            const month = date.getMonth() + 1; // TODO: For some reason, this is necessary
            const monthStr: String = month < 10 ? "0" + month : month.toString();
            const day = date.getDate();
            const dayStr: String = day < 10 ? "0" + day : day.toString();

            // Deals with event for today
            const fullCalendarEvents: FullCalendarEventsType[] = goals.map((challenge: Goal) => {
                return {
                    "title": challenge.title,
                    "date": `${date.getFullYear()}-${monthStr}-${dayStr}`
                };
            });

            return fullCalendarEvents;
        }

        function buildEvents(): any {
            let fullCalendarEvents: FullCalendarEventsType[] = []; // starts empty

            // Deals with standard goals
            for (let u = 0; u < goals.length; u++) {
                const dayEvents = buildDayEvents(goals[u].date, goals[u].goals); // already return an array of FullCalendarEventsType
                fullCalendarEvents = fullCalendarEvents.concat(dayEvents);
            }

            // Deals with user-created goals
            for (let u = 0; u < userGoals.length; u++) {
                const userGoal = userGoals[u];
                const goalDate = new Date(userGoal.date);

                const userGoalFullCalendarEvent = buildDayEvents(goalDate, [{ // array with single Goal
                    id: userGoal.id;
                    title: userGoal.name,
                    description: "no-description" // TODO: fix this later
                }]);

                fullCalendarEvents = fullCalendarEvents.concat(userGoalFullCalendarEvent);
            }

            return fullCalendarEvents;
        }

        const events: FullCalendarEventsType[] = buildEvents();
        //console.log(events)
        return events;*/
    }

    const handleDateClick = (clickedDay: CalendarDay) => {
        setSelectedDate(clickedDay.date);

        // TODO: I don't see any reason for this anymore
        /*
        if (startDate != undefined && goals != undefined) {

            //calculate time difference
            var time_difference = clickedDay.date.getTime() - startDate.getTime();
            //calculate days difference by dividing total milliseconds in a day
            var daysDifference = time_difference / (1000 * 60 * 60 * 24);

            if (daysDifference >= 0 && daysDifference < goals.length) {
                setSelectedDate(clickedDay.date)
            }
        }
        */
    };

    const onConfirmNewNoteSubmitClickHandler = (noteText: string) => {
        service.createNewUserNote(noteText, selectedDate) // TODO: handle error later
            .then(() => fetchUserCurrentDayAndLoadGoals()) // TODO: improve later
            .catch((error) => setError(error));
    };

    return { goals, userNotes, selectedDate, handleDateClick, onConfirmNewNoteSubmitClickHandler };
}