import { Calendar, Event as CalendarEvent, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { Event, NewEventInfo, service } from "~/service/service";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";
import "./CreateEvent/createEventReactAriaModal.css";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import styles from "./calendarPage.module.css";
import { RequireAuthn } from "~/components/auth/RequireAuthn";
import { CreateEventModal } from "./CreateEvent/CreateEvent";
import { useTranslation } from "react-i18next";
import { EditEventModal } from "./CreateEvent/EditEvent";
import { useTags } from "~/hooks/useTags";

const localizer = momentLocalizer(moment);

type EventsView =
    | "allEvents"
    | "recurringEvents"

function useMyCalendar() {
    const setError = useSetGlobalError();

    const [events, setEvents] = useState<CalendarEvent[]>([]);

    const [newEventStartDate, setNewEventStartDate] = useState<Date>(new Date());
    const [newEventEndDate, setNewEventEndDate] = useState<Date>(new Date());
    const [newEventTitle, setNewEventTitle] = useState<string | undefined>(undefined);

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
        service.getUserRecurrentEvents()
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
        service.getUserEvents(false)
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
        service.createNewEvent(event)
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
        newEventStartDate,
        setNewEventStartDate,
        newEventEndDate,
        setNewEventEndDate,
        newEventTitle,
        setNewEventTitle,
        createNewEvent,
        toggleEventsView
    };
}

function MyCalendar() {
    const {
        events,
        calendarView,
        setCalendarView,
        eventsView,
        isNewEventRecurrent,
        setIsNewEventRecurrent,
        setDisplayedDates,
        refreshUserEvents,
        newEventStartDate,
        setNewEventStartDate,
        newEventEndDate,
        setNewEventEndDate,
        newEventTitle,
        setNewEventTitle,
        createNewEvent,
        toggleEventsView
    } = useMyCalendar();
    const [edittedEventStartDate, setEdittedEventStartDate] = useState<Date>(new Date());
    const [edittedEventEndDate, setEdittedEventEndDate] = useState<Date>(new Date());
    const [edittedEventTitle, setEdittedEventTitle] = useState<string | undefined>(undefined);

    const [isEdittedEventRecurrent, setIsEdittedEventRecurrent] = useState<boolean>(false);

    const { t } = useTranslation(["calendar"]);

    const { tags, appendTag, removeTag } = useTags();

    const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
    const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);

    // This is invoked when the user uses the mouse to create a new event
    const handleSelectSlot = useCallback(
        ({ start, end }: { start: Date, end: Date }) => {
            setNewEventStartDate(start);
            setNewEventEndDate(end);
            setIsCreateEventModalOpen(true);
        }, []);

    // This is invoked when the user clicks on an event
    const handleSelectEvent = useCallback(
        (event: CalendarEvent) => {
            if (event.title != undefined) {
                setEdittedEventTitle(event.title as string);
            }
            if (event.start != undefined) {
                setEdittedEventStartDate(event.start);
            }
            if (event.end != undefined) {
                setEdittedEventEndDate(event.end);
            }

            setIsEditEventModalOpen(true);

            console.log("My event: ", event);
        }, []);

    // This is invoked when the user navigates across months/weeks/days with React-Big-Calendar button
    const onRangeChange = useCallback((range: Date[] | { start: Date; end: Date; }) => {
        if (!(range instanceof Array)) {
            setDisplayedDates([range.start, range.end]);
        }

        setDisplayedDates(range as Date[]);
    }, [eventsView, calendarView]);

    const onView = useCallback((newView: any) => {
        setCalendarView(newView);
    }, [setCalendarView]);

    // Title and dates set. Now it's time to choose tags!
    return (
        <div className={styles.calendarPageContainer}>
            <CreateEventModal
                isModalOpen={isCreateEventModalOpen}
                setIsModalOpen={setIsCreateEventModalOpen}
                newEventTitle={newEventTitle}
                setNewEventTitle={setNewEventTitle}
                newEventStartDate={newEventStartDate}
                setNewEventStartDate={setNewEventStartDate}
                newEventEndDate={newEventEndDate}
                setNewEventEndDate={setNewEventEndDate}
                refreshUserEvents={refreshUserEvents}
            />
            <EditEventModal
                isModalOpen={isEditEventModalOpen}
                setIsModalOpen={setIsEditEventModalOpen}
                eventTitle={edittedEventTitle}
                setEventTitle={setEdittedEventTitle}
                eventStartDate={edittedEventStartDate}
                setEventStartDate={setEdittedEventStartDate}
                eventEndDate={edittedEventEndDate}
                setEventEndDate={setEdittedEventEndDate}
                refreshUserEvents={refreshUserEvents}
            />
            <button onClick={toggleEventsView}>
                {eventsView == "allEvents" ?
                    (<span>
                        {t("calendar:display_only_recurring_events_button")}
                    </span>)
                    :
                    (<span>
                        {t("calendar:display_all_events_button")}
                    </span>)
                }
            </button>
            <div className={styles.calendarContainer}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    onSelectEvent={handleSelectEvent}
                    onSelectSlot={handleSelectSlot}
                    selectable={"ignoreEvents"}
                    onRangeChange={onRangeChange}
                    view={calendarView}
                    onView={onView}
                    popup={true}
                />
            </div>
        </div>
    );
}

export default function MyCalendarAuthControlled() {
    return (
        <RequireAuthn>
            <MyCalendar />
        </RequireAuthn>
    );
}