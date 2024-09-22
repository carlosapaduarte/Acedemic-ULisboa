import { Calendar, Event as CalendarEvent, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { utils } from "~/utils";
import { Event, NewEventInfo, service } from "~/service/service";

import "react-big-calendar/lib/css/react-big-calendar.css";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { CategoryAndTagsPicker, useTags } from "../commons";
import styles from "./calendarPage.module.css";

const localizer = momentLocalizer(moment);

// This type is used to store Event info before User get's the opportunity to select tags
type NewEventTitleAndDate = {
    title: string,
    start: Date,
    end: Date,
}

type EventsView =
    | "allEvents"
    | "recurringEvents"

function useMyCalendar() {
    const setError = useSetGlobalError();

    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [newEventTitleAndName, setNewEventTitleAndName] = useState<NewEventTitleAndDate>();
    const [isNewEventRecurrent, setIsNewEventRecurrent] = useState<boolean>(false);

    const [calendarView, setCalendarView] = useState<View>(Views.WEEK);
    const [eventsView, setEventsView] = useState<EventsView>("allEvents");

    const [displayedDates, setDisplayedDates] = useState<Date[]>([]);

    useEffect(() => {
        if (eventsView == "allEvents")
            refreshUserEvents();
        else
            refreshUserRecurrentEvents(displayedDates);
    }, [eventsView]);

    useEffect(() => {
        if (eventsView == "recurringEvents")
            refreshUserRecurrentEvents(displayedDates);
    }, [displayedDates]);

    function toggleEventsView() {
        if (eventsView == "allEvents")
            setEventsView("recurringEvents");
        else
            setEventsView("allEvents");
    }

    function refreshUserRecurrentEvents(calendarDisplayedDates: Date[]) {
        const userId = utils.getUserId();
        service.getUserRecurrentEvents(userId)
            .then((events: Event[]) => {
                const calendarEvents: CalendarEvent[] = [];
                calendarDisplayedDates.forEach((displayedDate: Date) => {
                    events
                        .filter((event: Event) => event.startDate.getDay() == displayedDate.getDay()) // Same week day
                        .forEach((event: Event) => {

                            // Builds the event for the current displayed week
                            const start = new Date(displayedDate);
                            start.setHours(event.startDate.getHours());
                            start.setMinutes(event.startDate.getMinutes());
                            const end = new Date(displayedDate);
                            end.setHours(event.endDate.getHours());
                            end.setMinutes(event.endDate.getMinutes());

                            calendarEvents.push({
                                title: event.title,
                                start: start,
                                end: end,
                                resource: { tags: event.tags }
                            });
                        });
                });
                setEvents(calendarEvents);
            });
    }

    function refreshUserEvents() {
        const userId = utils.getUserId();
        service.getUserEvents(userId, false)
            .then((events: Event[]) => {
                //console.log(events)
                const calendarEvents: CalendarEvent[] = events.map((event: Event) => {
                    return {
                        title: event.title,
                        start: event.startDate,
                        end: event.endDate,
                        resource: { tags: event.tags }
                    };
                });
                setEvents(calendarEvents);
            });
    }

    function createNewEvent(event: NewEventInfo, onDone: () => void) {
        const userId = utils.getUserId();
        service.createNewEvent(userId, event)
            .then(onDone)
            .catch((error) => setError(error));
    }

    return {
        events,
        calendarView,
        setCalendarView,
        eventsView,
        isNewEventRecurrent,
        setIsNewEventRecurrent,
        setDisplayedDates,
        refreshUserEvents,
        newEventTitleAndName,
        setNewEventTitleAndName,
        createNewEvent,
        toggleEventsView
    };
}

export default function MyCalendar() {
    const {
        events,
        calendarView,
        setCalendarView,
        eventsView,
        isNewEventRecurrent,
        setIsNewEventRecurrent,
        setDisplayedDates,
        refreshUserEvents,
        newEventTitleAndName,
        setNewEventTitleAndName,
        createNewEvent,
        toggleEventsView
    } = useMyCalendar();
    const { tags, appendTag, removeTag } = useTags();

    // This is invoked when the user uses the mouse to create a new event
    const handleSelectSlot = useCallback(
        ({ start, end }) => {
            const title: string | null = window.prompt("New Event Name");
            if (title) {
                setNewEventTitleAndName({ title, start, end });
            }
        }, []);

    // This is invoked when the user clicks on an event
    const handleSelectEvent = useCallback(
        (event: CalendarEvent) => window.alert(`Title: ${event.title}\nTags: ${event.resource?.tags}`),
        []
    );

    // This is invoked when the user navigates across months/weeks/days with React-Big-Calendar button
    const onRangeChange = useCallback((range) => {
        //console.log(range)

        setDisplayedDates(range);
    }, [eventsView, calendarView]);


    function onCreateEventClickHandler(eventInfo: NewEventTitleAndDate) {
        createNewEvent({
            title: eventInfo.title,
            startDate: eventInfo.start,
            endDate: eventInfo.end,
            tags,
            everyWeek: isNewEventRecurrent
        }, () => {
            setNewEventTitleAndName(undefined); // Values used, discard now...
            refreshUserEvents();
        });
    }

    // Title and dates set. Now it's time to choose tags!
    return (
        <div className={styles.calendarContainer}>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable
                onRangeChange={onRangeChange}
                view={calendarView}
                onView={(newView) => setCalendarView(newView)}
                style={{ height: 500 }}
            />

            <button onClick={toggleEventsView}>
                {eventsView == "allEvents" ?
                    (<span>Click To Display Only Recurring Events</span>)
                    :
                    (<span>Click To Display All Events</span>)
                }
            </button>

            {newEventTitleAndName ?
                <div>
                    <CategoryAndTagsPicker tags={[]} appendTag={appendTag} removeTag={removeTag} />
                    <input type="checkbox" id="scales" name="scales" value={isNewEventRecurrent.toString()}
                           onChange={(e) => setIsNewEventRecurrent((Boolean)(e.target.value))} />
                    <label>Every Week</label>
                    <button onClick={() => onCreateEventClickHandler(newEventTitleAndName)}>
                        Confirm!
                    </button>
                </div>
                :
                <></>
            }
        </div>
    );
}