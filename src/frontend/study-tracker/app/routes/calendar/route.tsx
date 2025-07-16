// src/frontend/study-tracker/app/routes/calendar/route.tsx
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

import "moment/locale/pt";

import { getCalendarMessages } from "../../calendarUtils";

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

  useEffect(() => {
    if (eventsView === "allEvents") refreshUserEvents();
    else refreshUserRecurrentEvents(displayedDates);
  }, [eventsView, displayedDates]);

  useEffect(() => {
    if (calendarView === Views.MONTH) setEventsView("allEvents");
  }, [calendarView]);

  useEffect(() => {
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
  }, [displayedDates]);

  function toggleEventsView() {
    if (eventsView === "allEvents") setEventsView("recurringEvents");
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
            (event: Event) =>
              event.startDate.getDay() === displayedDate.getDay()
          )
          .forEach((event: Event) => {
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
        const key = `${ev.resource.id}-${ev.start.toISOString().slice(0, 10)}`;
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

  const { t, i18n } = useTranslation(["calendar"]);

  useEffect(() => {
    moment.locale(i18n.language);
    console.log("Moment.js locale set to:", moment.locale());
  }, [i18n.language]);

  const localizer = momentLocalizer(moment);

  const [isWideScreen, setIsWideScreen] = useState(window.innerWidth > 400);

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth > 400);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { tags, appendTag, removeTag } = useTags();

  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      setNewEventStartDate(start);
      setNewEventEndDate(end);
      setIsCreateEventModalOpen(true);
    },
    []
  );

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    if (event.resource.id !== undefined) {
      setEditedEventId(event.resource.id as number);
    }
    if (event.title !== undefined) {
      setEditedEventTitle(event.title as string);
    }
    if (event.start !== undefined) {
      setEditedEventStartDate(event.start);
    }
    if (event.end !== undefined) {
      setEditedEventEndDate(event.end);
    }
    if (event.resource.tags !== undefined) {
      setEditedEventTags(event.resource.tags as string[]);
    }
    if (event.resource.everyWeek !== undefined) {
      setEditedEventRecurrent(event.resource.everyWeek as boolean);
    }

    setIsEditEventModalOpen(true);
  }, []);

  const onRangeChange = useCallback(
    (range: Date[] | { start: Date; end: Date }) => {
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
      } else {
        setDisplayedDates(range as Date[]);
      }
    },
    [eventsView, calendarView, setDisplayedDates]
  );

  const onView = useCallback(
    (newView: View) => {
      setCalendarView(newView);
    },
    [setCalendarView]
  );

  // Obtem as mensagens traduzidas para o calendário
  const calendarMessages = getCalendarMessages();

  const calendarFormats = {
    monthHeaderFormat: (date: Date, culture?: string) =>
      moment(date)
        .locale(culture || i18n.language)
        .format(t("rbc_month_header_format")),
    weekHeaderFormat: (date: Date, culture?: string) =>
      moment(date)
        .locale(culture || i18n.language)
        .format(t("rbc_week_header_format")),
    dayHeaderFormat: (date: Date, culture?: string) =>
      moment(date)
        .locale(culture || i18n.language)
        .format(t("rbc_day_header_format")),
    agendaDateFormat: (date: Date, culture?: string) =>
      moment(date)
        .locale(culture || i18n.language)
        .format(t("rbc_agenda_column_format")),
    agendaDayFormat: (date: Date, culture?: string) =>
      moment(date)
        .locale(culture || i18n.language)
        .format("dddd"), // 'dddd' para nome completo do dia

    agendaTimeFormat: (date: Date, culture?: string) =>
      moment(date)
        .locale(culture || i18n.language)
        .format(t("rbc_time_format")),

    // Formato de hora no lado esquerdo do calendário (slots de tempo)
    timeGutterFormat: (date: Date, culture?: string) =>
      moment(date)
        .locale(culture || i18n.language)
        .format(t("rbc_time_format")),

    // Formato do intervalo de tempo dos eventos
    eventTimeRangeFormat: (
      range: { start: Date; end: Date },
      culture?: string
    ) =>
      `${moment(range.start)
        .locale(culture || i18n.language)
        .format(t("rbc_time_range_format"))} - ${moment(range.end)
        .locale(culture || i18n.language)
        .format(t("rbc_time_range_format"))}`,
  };

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
      {calendarView !== Views.MONTH ? (
        <button onClick={toggleEventsView}>
          {eventsView === "allEvents" ? (
            <span>{t("display_only_recurring_events_button")}</span>
          ) : (
            <span>{t("display_all_events_button")}</span>
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
                  `weekdays.${days[props.date.getDay()]}.${
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
          messages={calendarMessages}
          culture={i18n.language}
          formats={calendarFormats}
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
