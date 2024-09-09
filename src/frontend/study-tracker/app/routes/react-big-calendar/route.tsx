import { Calendar, momentLocalizer, Event as CalendarEvent } from "react-big-calendar";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { utils } from "~/utils";
import { NewEventInfo, service } from "~/service/service";
import { Event } from "~/service/service";

import "react-big-calendar/lib/css/react-big-calendar.css"
import { useSetError } from "~/components/error/ErrorContainer";
import { CategoryAndTagsPicker, useTags } from "../commons";

const localizer = momentLocalizer(moment);

// This type is used to store Event info before User get's the opportunity to select tags
type NewEventTitleAndDate = {
    title: string,
    start: Date,
    end: Date,
}

function useMyCalendar() {
    const setError = useSetError();
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [newEventTitleAndName, setNewEventTitleAndName] = useState<NewEventTitleAndDate>()

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
                setEvents(calendarEvents)
            })
    }

    function createNewEvent(event: NewEventInfo) {
        const userId = utils.getUserId()
        service.createNewEvent(userId, event)
            .catch((error) => setError(error))
    }

    return {events, updateUserEvents, newEventTitleAndName, setNewEventTitleAndName, createNewEvent}
}

export default function MyCalendar() {
    const {events, updateUserEvents, newEventTitleAndName, setNewEventTitleAndName, createNewEvent} = useMyCalendar()
    const {tags, appendTag} = useTags()

    const handleSelectSlot = useCallback(
        ({ start, end }) => {
            const title: string | null = window.prompt('New Event Name')
            if (title) {
                setNewEventTitleAndName({title, start, end})   
            }
        }, [])

    const handleSelectEvent = useCallback(
        (event) => window.alert(event.title),
        []
    )

    function onTagsConfirmClickHandler(eventInfo: NewEventTitleAndDate) {
        createNewEvent({
            title: eventInfo.title,
            startDate: eventInfo.start,
            endDate: eventInfo.end,
            tags,
            everyWeek: false
        })
        setNewEventTitleAndName(undefined) // Values used, discard now...
        updateUserEvents()
    }

    // Title and dates set. Now it's time to choose tags!
    if (newEventTitleAndName)
        return (
            <div>
                <CategoryAndTagsPicker onTagClick={appendTag}/>
                <button onClick={() => onTagsConfirmClickHandler(newEventTitleAndName)}>
                    Confirm!
                </button>
            </div>
        )
    else
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