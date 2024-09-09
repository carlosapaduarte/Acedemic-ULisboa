import { Calendar, momentLocalizer, Event as CalendarEvent } from "react-big-calendar";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { utils } from "~/utils";
import { service } from "~/service/service";
import { Event } from "~/service/service";

import "react-big-calendar/lib/css/react-big-calendar.css"
import { useSetError } from "~/components/error/ErrorContainer";

const localizer = momentLocalizer(moment);

function useMyCalendar() {
    const [events, setEvents] = useState<CalendarEvent[]>([])

    useEffect(() => {
        updateUserEvents()
    }, [])

    function updateUserEvents() {
        const userId = utils.getUserId()
        service.getUserEvents(userId, false)
            .then((events: Event[]) => {
                const calendarEvents: CalendarEvent[] = events.map((event: Event) => {
                    return {
                        title: event.title,
                        start: event.startDate,
                        end: event.endDate,
                    }
                })
                console.log(calendarEvents)
                setEvents(calendarEvents)
            })
    }

    return {events, updateUserEvents}
}

export default function MyCalendar() {
    const {events, updateUserEvents} = useMyCalendar()
    const setError = useSetError();

    const handleSelectSlot = useCallback(
        ({ start, end }) => {
            const title: string | null = window.prompt('New Event Name')
            if (title) {
                const userId = utils.getUserId()
                service.createNewEvent(userId, {
                    title,
                    startDate: start as Date, // Improve casting later
                    endDate: end as Date,
                    tags: [],
                    everyWeek: false
                })
                    .then(() => updateUserEvents())
                    .catch((error) => setError(error));
            }
        },
        []
      )

    const handleSelectEvent = useCallback(
        (event) => window.alert(event.title),
        []
    )

    return (
        <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            style={{ height: 500 }}
        />
    )
}