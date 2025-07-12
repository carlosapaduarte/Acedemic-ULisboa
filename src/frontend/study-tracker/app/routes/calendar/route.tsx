import {
  Calendar,
  Event as CalendarEvent,
  momentLocalizer,
  View,
  Views,
} from "react-big-calendar";
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
import { utils } from "~/utils";

const localizer = momentLocalizer(moment);

type EventsView = "allEvents" | "recurringEvents";

function useMyCalendar() {
  const setGlobalError = useSetGlobalError();

  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [newEventStartDate, setNewEventStartDate] = useState<Date>(new Date());
  const [newEventEndDate, setNewEventEndDate] = useState<Date>(new Date());
  const [newEventTitle, setNewEventTitle] = useState<string | undefined>(
    undefined
  );

  const [isNewEventRecurrent, setIsNewEventRecurrent] =
    useState<boolean>(false);

  const [calendarView, setCalendarView] = useState<View>(Views.WEEK);
  const [eventsView, setEventsView] = useState<EventsView>("allEvents");

  const [displayedDates, setDisplayedDates] = useState<Date[]>([]);

  //console.log(events)
  //console.log(calendarView)

  useEffect(() => {
    if (eventsView == "allEvents") refreshUserEvents();
    else refreshUserRecurrentEvents(displayedDates);
  }, [eventsView]);

  useEffect(() => {
    if (eventsView === "allEvents") refreshUserEvents();
  }, [displayedDates]);

  useEffect(() => {
    if (eventsView == "recurringEvents")
      refreshUserRecurrentEvents(displayedDates);
  }, [displayedDates]);

  // If user selects Month view, change to "allEvents" automatically
  useEffect(() => {
    if (calendarView == Views.MONTH) setEventsView("allEvents");
  }, [calendarView]);

  if (displayedDates.length === 0) {
    const today = new Date();
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - today.getDay() + i);
      dates.push(d);
    }
    setDisplayedDates(dates);
  }

  function toggleEventsView() {
    if (eventsView == "allEvents") setEventsView("recurringEvents");
    else setEventsView("allEvents");
  }

  function refreshUserRecurrentEvents(calendarDisplayedDates: Date[]) {
    service.getUserEvents(false, true).then((events: Event[]) => {
      console.log(calendarDisplayedDates);
      console.log(events);
      const calendarEvents: CalendarEvent[] = [];
      calendarDisplayedDates.forEach((displayedDate: Date) => {
        events
          .filter(
            (event: Event) => event.startDate.getDay() == displayedDate.getDay()
          ) // Same week day
          .forEach((event: Event) => {
            // Builds the event for the current displayed week
            const start = new Date(displayedDate);
            start.setHours(event.startDate.getHours());
            start.setMinutes(event.startDate.getMinutes());

            const end = new Date(displayedDate);
            end.setHours(event.endDate.getHours());
            end.setMinutes(event.endDate.getMinutes());

            const calendarEvent = {
              title: event.title,
              start: start,
              end: end,
              resource: {
                id: event.id,
                tags: event.tags,
                everyWeek: event.everyWeek,
              },
            };

            calendarEvents.push(calendarEvent);
          });
      });
      setEvents(calendarEvents);
    });
  }

  function refreshUserEvents() {
    if (displayedDates.length === 0) {
      console.warn("No displayed dates set, cannot fetch events.");
      return;
    }
    service.getAllUserEvents().then((events: Event[]) => {
      const temp: CalendarEvent[] = [];

      displayedDates.forEach((date) => {
        events.forEach((event) => {
          const isSameDay = utils.sameDay(event.startDate, date);
          const isRecurringOnDay =
            event.everyWeek && event.startDate.getDay() === date.getDay();

          if (!isSameDay && !isRecurringOnDay) return;

          const start = new Date(date);
          start.setHours(
            event.startDate.getHours(),
            event.startDate.getMinutes()
          );

          const end = new Date(date);
          end.setHours(event.endDate.getHours(), event.endDate.getMinutes());

          temp.push({
            title: event.title,
            start,
            end,
            resource: {
              id: event.id,
              tags: event.tags,
              everyWeek: event.everyWeek,
            },
          });
        });
      });

      const unique = new Map<string, CalendarEvent>();
      temp.forEach((ev) => {
        const key = `${ev.resource.id}-${ev.start.toISOString().slice(0, 10)}`; // só dia
        if (!unique.has(key)) unique.set(key, ev);
      });

      const calendarEvents = Array.from(unique.values());
      setEvents(calendarEvents);
    });
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
    toggleEventsView,
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
    toggleEventsView,
  } = useMyCalendar();
  const [editedEventId, setEditedEventId] = useState<number | undefined>(
    undefined
  );
  const [editedEventStartDate, setEditedEventStartDate] = useState<Date>(
    new Date()
  );
  const [editedEventEndDate, setEditedEventEndDate] = useState<Date>(
    new Date()
  );
  const [editedEventTitle, setEditedEventTitle] = useState<string | undefined>(
    undefined
  );
  const [editedEventTags, setEditedEventTags] = useState<string[]>([]);
  const [editedEventRecurrent, setEditedEventRecurrent] =
    useState<boolean>(false);

  const { t } = useTranslation(["calendar"]);

  const [isWideScreen, setIsWideScreen] = useState(window.innerWidth > 400);

  useEffect(() => {
    window.addEventListener("resize", () => {
      if (window.innerWidth > 400) {
        setIsWideScreen(true);
      } else {
        setIsWideScreen(false);
      }
    });
  }, []);

  const { tags, appendTag, removeTag } = useTags();

  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);

  // This is invoked when the user uses the mouse to create a new event
  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      setNewEventStartDate(start);
      setNewEventEndDate(end);
      setIsCreateEventModalOpen(true);
    },
    []
  );

  // This is invoked when the user clicks on an event
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    if (event.resource.id != undefined) {
      setEditedEventId(event.resource.id as number);
    }
    if (event.title != undefined) {
      setEditedEventTitle(event.title as string);
    }
    if (event.start != undefined) {
      setEditedEventStartDate(event.start);
    }
    if (event.end != undefined) {
      setEditedEventEndDate(event.end);
    }
    if (event.resource.tags != undefined) {
      setEditedEventTags(event.resource.tags as string[]);
    }
    if (event.resource.everyWeek != undefined) {
      setEditedEventRecurrent(event.resource.everyWeek as boolean);
    }

    setIsEditEventModalOpen(true);

    // console.log("My event: ", event);
  }, []);

  // This is invoked when the user navigates across months/weeks/days with React-Big-Calendar button
  const onRangeChange = useCallback(
    (range: Date[] | { start: Date; end: Date }) => {
      // When "agenda" view type is selected
      if (!(range instanceof Array)) {
        const dates: Date[] = [];
        let curDate = new Date(range.start);
        while (true) {
          if (utils.sameDay(curDate, range.end)) break;

          dates.push(curDate);

          curDate = new Date(curDate);
          curDate.setDate(curDate.getDate() + 1);
        }
        setDisplayedDates(dates);
      } else setDisplayedDates(range as Date[]);
    },
    [eventsView, calendarView]
  );

  const onView = useCallback(
    (newView: any) => {
      setCalendarView(newView);
    },
    [setCalendarView]
  );

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
      {editedEventId && (
        <EditEventModal
          isModalOpen={isEditEventModalOpen}
          setIsModalOpen={setIsEditEventModalOpen}
          eventId={editedEventId}
          eventTitle={editedEventTitle}
          setEventTitle={setEditedEventTitle}
          eventStartDate={editedEventStartDate}
          setEventStartDate={setEditedEventStartDate}
          eventEndDate={editedEventEndDate}
          setEventEndDate={setEditedEventEndDate}
          eventTags={editedEventTags}
          setEventTags={setEditedEventTags}
          eventRecurrent={editedEventRecurrent}
          setEventRecurrent={setEditedEventRecurrent}
          refreshUserEvents={refreshUserEvents}
        />
      )}
      {calendarView != Views.MONTH ? (
        <button onClick={toggleEventsView}>
          {eventsView == "allEvents" ? (
            <span>{t("calendar:display_only_recurring_events_button")}</span>
          ) : (
            <span>{t("calendar:display_all_events_button")}</span>
          )}
        </button>
      ) : (
        <></>
      )}
      <div className={styles.calendarContainer}>
        <Calendar
          components={{
            week: {
              header: (props: any) => {
                /*console.log("Props: ", props);*/
                const days = [
                  "sunday",
                  "monday",
                  "tuesday",
                  "wednesday",
                  "thursday",
                  "friday",
                  "saturday",
                ];
                const dayOfWeekName = t(
                  `calendar:weekdays.${days[props.date.getDay()]}.${
                    isWideScreen ? "medium" : "short"
                  }`
                );

                return (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div>{dayOfWeekName}</div>
                    <div>{props.date.getDate()}</div>
                  </div>
                );
              },
            },
          }}
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
