import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { useEffect, useState } from "react";
import { DayChallenges } from "~/challenges/types";
import { service, UserInfo, UserNote } from "~/service/service";
import { utils } from "~/utils";
import { CalendarDay } from "~/routes/calendar/components/MyCalendar/MyCalendar";

export function useCalendar() {
    const setError = useSetGlobalError();

    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [challenges, setChallenges] = useState<DayChallenges[] | undefined>(undefined);
    const [userNotes, setUserNotes] = useState<UserNote[] | undefined>(undefined);

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    type FullCalendarEventsType = {
        title: String,
        date: String
    }

    async function fetchUserCurrentDayAndLoadChallenges() {
        try {
            const userInfo: UserInfo = await service.fetchUserInfoFromApi();

            // For simplification, use the first one
            const batchToDisplay = userInfo.batches[0];
            const level = batchToDisplay.level;
            const startDate = new Date(2024, 7, 10, 12, 22, 22, 22);
            //const startDate = new Date(batchToDisplay.startDate * 1000) // Feel free to change for testing
            const userChallenges = utils.getUserChallenges(level, startDate);

            console.log("User challenges: ", userChallenges, "Start date: ", startDate, "User notes ", userInfo.userNotes);

            setStartDate(startDate);
            setChallenges(userChallenges);
            setUserNotes(userInfo.userNotes);
        } catch (error: any) {
            setError(error);
        }
    }

    useEffect(() => {
        fetchUserCurrentDayAndLoadChallenges();
    }, []);

    // Builds an object to display events in FullCalendar
    function buildEvents(challenges: DayChallenges[], userChallenges: UserNote[]): any {

        /* function buildDayEvents(date: Date, challenges: Challenge[]): FullCalendarEventsType[] {
             const month = date.getMonth() + 1; // TODO: For some reason, this is necessary
             const monthStr: String = month < 10 ? "0" + month : month.toString();
             const day = date.getDate();
             const dayStr: String = day < 10 ? "0" + day : day.toString();

             // Deals with event for today
             const fullCalendarEvents: FullCalendarEventsType[] = challenges.map((challenge: Challenge) => {
                 return {
                     "title": challenge.title,
                     "date": `${date.getFullYear()}-${monthStr}-${dayStr}`
                 };
             });

             return fullCalendarEvents;
         }

         function buildEvents(): any {
             let fullCalendarEvents: FullCalendarEventsType[] = []; // starts empty

             // Deals with standard challenges
             for (let u = 0; u < challenges.length; u++) {
                 const dayEvents = buildDayEvents(challenges[u].date, challenges[u].challenges); // already return an array of FullCalendarEventsType
                 fullCalendarEvents = fullCalendarEvents.concat(dayEvents);
             }

             // Deals with user-created challenges
             for (let u = 0; u < userChallenges.length; u++) {
                 const userChallenge = userChallenges[u];
                 const challengeDate = new Date(userChallenge.date);

                 const userChallengeFullCalendarEvent = buildDayEvents(challengeDate, [{ // array with single Challenge
                     id: userChallenge.id;
                     title: userChallenge.name,
                     description: "no-description" // TODO: fix this later
                 }]);

                 fullCalendarEvents = fullCalendarEvents.concat(userChallengeFullCalendarEvent);
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
        if (startDate != undefined && challenges != undefined) {

            //calculate time difference
            var time_difference = clickedDay.date.getTime() - startDate.getTime();
            //calculate days difference by dividing total milliseconds in a day
            var daysDifference = time_difference / (1000 * 60 * 60 * 24);

            if (daysDifference >= 0 && daysDifference < challenges.length) {
                setSelectedDate(clickedDay.date)
            }
        }
        */
    };

    const onConfirmNewNoteSubmitClickHandler = (noteText: string) => {
        service.createNewUserNote(noteText, selectedDate) // TODO: handle error later
            .then(() => fetchUserCurrentDayAndLoadChallenges()) // TODO: improve later
            .catch((error) => setError(error));
    };

    return { challenges, userNotes, selectedDate, handleDateClick, onConfirmNewNoteSubmitClickHandler };
}