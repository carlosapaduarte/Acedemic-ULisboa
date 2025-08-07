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

function inferColorFromTags(tags: string[] = []): string | undefined {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const tagColorMap: { [key: string]: string } = {
    estudo: "#10B981",
    study: "#10B981",
    trabalho: "#0F02F6",
    work: "#0F02F6",
    pessoal: "#B39BEE",
    personal: "#B39BEE",
    lazer: "#EE6352",
    fun: "#EE6352",
  };

  const matchedColors: string[] = [];

  if (tags && tags.length > 0) {
    for (const rawTag of tags) {
      const normalizedTag = normalize(rawTag);
      for (const key in tagColorMap) {
        if (normalizedTag.includes(key)) {
          const color = tagColorMap[key];
          if (!matchedColors.includes(color)) matchedColors.push(color);
          break;
        }
      }
    }
  }

  if (matchedColors.length === 1) {
    return matchedColors[0];
  }
  if (matchedColors.length > 1) {
    return `linear-gradient(135deg, ${matchedColors.join(", ")})`;
  }

  //Fallback final se nenhuma tag corresponder - cinza para eventos sem tags (e sem customColor)
  if (!tags || !tags.length) return "#A0A0A0";

  return undefined;
}

interface CalendarEventResource {
  id: number;
  tags?: string[];
  everyWeek?: boolean;
  everyDay?: boolean;
  color?: string;
  originalStartDate?: Date;
  originalEndDate?: Date;
  notes?: string;
}

const EventWithTags = ({
  event,
}: {
  event: CalendarEvent & {
    resource: CalendarEventResource;
  };
}) => {
  const isRecurring = event.resource.everyWeek || event.resource.everyDay;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: "6px",
        overflow: "hidden",
        color: "white",
      }}
    >
      <div style={{ position: "relative", padding: "4px", height: "100%" }}>
        <div>{event.title}</div>
        {(event.resource.tags?.length > 0 || isRecurring) && (
          <div
            style={{
              position: "absolute",
              bottom: 4,
              right: 4,
              fontSize: "0.7em",
              background: "rgba(0,0,0,0.25)",
              padding: "3px 8px",
              borderRadius: "10px",
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            {isRecurring && (
              <span
                title="Evento Recorrente"
                style={{ display: "flex", alignItems: "center" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#e3e3e3"
                >
                  <path d="M280-80 120-240l160-160 56 58-62 62h406v-160h80v240H274l62 62-56 58Zm-80-440v-240h486l-62-62 56-58 160 160-160 160-56-58 62-62H280v160h-80Z" />
                </svg>{" "}
              </span>
            )}
            {event.resource.tags?.length > 0 && (
              <span>{event.resource.tags.join(", ")}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

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

  const [displayedDates, setDisplayedDates] = useState<Date[]>(() => {
    const today = new Date();
    const dates = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);

      d.setDate(d.getDate() - today.getDay() + i);

      dates.push(d);
    }

    return dates;
  });

  useEffect(() => {
    if (eventsView === "allEvents") refreshUserEvents();
    else refreshUserRecurrentEvents(displayedDates);
  }, [eventsView, displayedDates]);

  useEffect(() => {
    if (calendarView === Views.MONTH) setEventsView("allEvents");
  }, [calendarView]);

  function toggleEventsView() {
    if (eventsView === "allEvents") setEventsView("recurringEvents");
    else setEventsView("allEvents");
  }

  function refreshUserRecurrentEvents(calendarDisplayedDates: Date[]) {
    // service.getUserEvents(false, true) deve buscar apenas eventos recorrentes

    service.getUserEvents(false, true).then((events: Event[]) => {
      const calendarEvents: CalendarEvent[] = [];

      calendarDisplayedDates.forEach((displayedDate: Date) => {
        events

          .filter(
            (
              event: Event // Esta condição deve incluir tanto eventos semanais quanto diários
            ) =>
              event.startDate.getDay() === displayedDate.getDay() ||
              event.everyDay
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
                everyDay: event.everyDay,
                color: event.color,
              } as CalendarEventResource,
            };

            calendarEvents.push(calendarEvent);
          });
      });
      setEvents(calendarEvents);
    });
  }

  function refreshUserEvents() {
    service.getAllUserEvents().then((eventsFromBackend: Event[]) => {
      const allOccurrences: CalendarEvent[] = [];

      eventsFromBackend.forEach((event) => {
        displayedDates.forEach((currentDisplayDate) => {
          let shouldAddEvent = false;
          let eventOccurrenceStartDate = new Date(currentDisplayDate);
          let eventOccurrenceEndDate = new Date(currentDisplayDate);

          const eventStartDay = new Date(event.startDate);

          eventStartDay.setHours(0, 0, 0, 0); // const eventEndDay = new Date(event.endDate); // Não será mais usado diretamente para o filtro 'everyDay' // eventEndDay.setHours(0, 0, 0, 0);

          const displayDay = new Date(currentDisplayDate);
          displayDay.setHours(0, 0, 0, 0);

          if (!event.everyDay && !event.everyWeek) {
            // Lógica para eventos NÃO recorrentes
            if (utils.sameDay(event.startDate, currentDisplayDate)) {
              shouldAddEvent = true;
              eventOccurrenceStartDate.setHours(
                event.startDate.getHours(),
                event.startDate.getMinutes(),
                event.startDate.getSeconds(),
                event.startDate.getMilliseconds()
              );
              eventOccurrenceEndDate.setHours(
                event.endDate.getHours(),
                event.endDate.getMinutes(),
                event.endDate.getSeconds(),
                event.endDate.getMilliseconds()
              );
            }
          } else if (event.everyDay) {
            // Lógica para eventos DIÁRIOS
            // Se 'everyDay' é true, assume-se que deve ocorrer diariamente a partir do startDate
            // A endDate do evento original agora define apenas a hora de fim, não o limite de recorrência
            if (displayDay >= eventStartDay) {
              // Apenas verifica se o dia atual é a partir da data de início do evento recorrente
              shouldAddEvent = true;
              eventOccurrenceStartDate.setHours(
                event.startDate.getHours(),
                event.startDate.getMinutes(),
                event.startDate.getSeconds(),
                event.startDate.getMilliseconds()
              );
              eventOccurrenceEndDate.setHours(
                event.endDate.getHours(), // Usa a hora de fim original do evento
                event.endDate.getMinutes(),
                event.endDate.getSeconds(),
                event.endDate.getMilliseconds()
              );
            }
          } else if (event.everyWeek) {
            // Lógica para eventos SEMANAIS
            if (event.startDate.getDay() === currentDisplayDate.getDay()) {
              shouldAddEvent = true;
              eventOccurrenceStartDate.setHours(
                event.startDate.getHours(),
                event.startDate.getMinutes(),
                event.startDate.getSeconds(),
                event.startDate.getMilliseconds()
              );
              eventOccurrenceEndDate.setHours(
                event.endDate.getHours(),
                event.endDate.getMinutes(),
                event.endDate.getSeconds(),
                event.endDate.getMilliseconds()
              );
            }
          }

          if (shouldAddEvent) {
            allOccurrences.push({
              title: event.title,
              start: eventOccurrenceStartDate,
              end: eventOccurrenceEndDate,
              resource: {
                id: event.id,
                tags: event.tags,
                everyWeek: event.everyWeek,
                everyDay: event.everyDay,
                originalStartDate: event.startDate,
                originalEndDate: event.endDate,
                color: event.color,
              } as CalendarEventResource,
            });
          }
        });
      });

      const uniqueEventsMap = new Map<string, CalendarEvent>();

      allOccurrences.forEach((ev) => {
        const key = `${ev.resource.id}-${ev.start.toISOString().slice(0, 10)}`;

        if (!uniqueEventsMap.has(key)) {
          uniqueEventsMap.set(key, ev);
        }
      });

      setEvents(Array.from(uniqueEventsMap.values()));
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

        .format("dddd"),

    agendaTimeFormat: (date: Date, culture?: string) =>
      moment(date)
        .locale(culture || i18n.language)

        .format(t("rbc_time_format")),

    timeGutterFormat: (date: Date, culture?: string) =>
      moment(date)
        .locale(culture || i18n.language)

        .format(t("rbc_time_format")),

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
           {" "}
      {calendarView !== Views.MONTH ? (
        <button onClick={toggleEventsView}>
                   {" "}
          {eventsView === "allEvents" ? (
            <span>{t("display_only_recurring_events_button")}</span>
          ) : (
            <span>{t("display_all_events_button")}</span>
          )}
                 {" "}
        </button>
      ) : (
        <></>
      )}
      <div className={styles.calendarContainer}>
        <Calendar
          components={{
            event: EventWithTags,

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
          eventPropGetter={(
            event: CalendarEvent & { resource?: CalendarEventResource }
          ) => {
            const colorFromPickerOrBackend = event.resource?.color;
            const inferredTagColor = inferColorFromTags(event.resource?.tags);

            let effectiveColor: string;
            console.log("colorFromPickerOrBackend: ", colorFromPickerOrBackend);
            // Prioridade 1: Se a cor do picker/backend não for o fallback padrão #3399FF, use-a
            if (
              colorFromPickerOrBackend &&
              colorFromPickerOrBackend !== "#3399FF"
            ) {
              effectiveColor = colorFromPickerOrBackend;
            }
            // Prioridade 2: Senão, se uma cor puder ser inferida das tags, use-a
            else if (inferredTagColor) {
              effectiveColor = inferredTagColor;
            }
            // Prioridade 3: Senão, se a cor do picker/backend é o #3399FF (ou seja, foi o fallback), use-a.
            // Isso cobre o caso em que não há tags e o picker deu o azul padrão.
            else if (colorFromPickerOrBackend) {
              effectiveColor = colorFromPickerOrBackend;
            }
            // Prioridade 4: Fallback final para cinza se nada se aplicar.
            else {
              effectiveColor = "#A0A0A0";
            }

            const style: React.CSSProperties = {
              borderRadius: "5px",
              color: "white",
              border: "none",
            };

            if (
              typeof effectiveColor === "string" &&
              (effectiveColor.startsWith("linear-gradient") ||
                effectiveColor.includes("gradient"))
            ) {
              style.backgroundImage = effectiveColor;
            } else {
              style.backgroundColor = effectiveColor;
            }
            return { style };
          }}
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
