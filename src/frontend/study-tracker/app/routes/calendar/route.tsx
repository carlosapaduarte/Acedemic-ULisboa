import {
  Calendar,
  Event as CalendarEvent,
  momentLocalizer,
  View,
  Views,
} from "react-big-calendar";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { Event, service } from "~/service/service";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";
import "./CreateEvent/createEventReactAriaModal.css";
import styles from "./calendarPage.module.css";
import { RequireAuthn } from "~/components/auth/RequireAuthn";
import { EventModal, EventData } from "./CreateEvent/EventModal";
import { useTranslation } from "react-i18next";
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

  const matchedColors = Array.from(
    new Set(tags.map((tag) => tagColorMap[normalize(tag)]).filter(Boolean))
  );
  if (matchedColors.length === 1) return matchedColors[0];
  if (matchedColors.length > 1)
    return `linear-gradient(135deg, ${matchedColors.join(", ")})`;
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
  const [events, setEvents] = useState<CalendarEvent[]>([]);
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

  const refreshUserEvents = useCallback(() => {
    service.getAllUserEvents().then((eventsFromBackend: Event[]) => {
      const allOccurrences: CalendarEvent[] = [];
      eventsFromBackend.forEach((event) => {
        displayedDates.forEach((currentDisplayDate) => {
          let shouldAddEvent = false;
          let eventOccurrenceStartDate = new Date(currentDisplayDate);
          let eventOccurrenceEndDate = new Date(currentDisplayDate);
          const eventStartDay = new Date(event.startDate);
          eventStartDay.setHours(0, 0, 0, 0);
          const displayDay = new Date(currentDisplayDate);
          displayDay.setHours(0, 0, 0, 0);

          if (!event.everyDay && !event.everyWeek) {
            if (utils.sameDay(event.startDate, currentDisplayDate)) {
              shouldAddEvent = true;
              eventOccurrenceStartDate = new Date(event.startDate);
              eventOccurrenceEndDate = new Date(event.endDate);
            }
          } else if (event.everyDay) {
            if (displayDay >= eventStartDay) {
              shouldAddEvent = true;
              eventOccurrenceStartDate.setHours(
                event.startDate.getHours(),
                event.startDate.getMinutes()
              );
              eventOccurrenceEndDate.setHours(
                event.endDate.getHours(),
                event.endDate.getMinutes()
              );
            }
          } else if (event.everyWeek) {
            if (
              event.startDate.getDay() === currentDisplayDate.getDay() &&
              displayDay >= eventStartDay
            ) {
              shouldAddEvent = true;
              eventOccurrenceStartDate.setHours(
                event.startDate.getHours(),
                event.startDate.getMinutes()
              );
              eventOccurrenceEndDate.setHours(
                event.endDate.getHours(),
                event.endDate.getMinutes()
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
                notes: event.notes,
              } as CalendarEventResource,
            });
          }
        });
      });
      const uniqueEventsMap = new Map<string, CalendarEvent>();
      allOccurrences.forEach((ev) => {
        const key = `${(ev.resource as CalendarEventResource).id}-${ev
          .start!.toISOString()
          .slice(0, 10)}`;
        if (!uniqueEventsMap.has(key)) {
          uniqueEventsMap.set(key, ev);
        }
      });
      setEvents(Array.from(uniqueEventsMap.values()));
    });
  }, [displayedDates]);

  function refreshUserRecurrentEvents(calendarDisplayedDates: Date[]) {
    service.getUserEvents(false, true).then((events: Event[]) => {
      const calendarEvents: CalendarEvent[] = [];

      calendarDisplayedDates.forEach((displayedDate: Date) => {
        events
          .filter(
            (event: Event) =>
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
                notes: event.notes,
              } as CalendarEventResource,
            };

            calendarEvents.push(calendarEvent);
          });
      });
      setEvents(calendarEvents);
    });
  }

  useEffect(() => {
    if (eventsView === "allEvents") refreshUserEvents();
    else refreshUserRecurrentEvents(displayedDates);
  }, [eventsView, displayedDates, refreshUserEvents]);

  useEffect(() => {
    if (calendarView === Views.MONTH) setEventsView("allEvents");
  }, [calendarView]);

  function toggleEventsView() {
    if (eventsView === "allEvents") setEventsView("recurringEvents");
    else setEventsView("allEvents");
  }

  return {
    events,
    calendarView,
    setCalendarView,
    eventsView,
    setDisplayedDates,
    refreshUserEvents,
    toggleEventsView,
  };
}

function MyCalendar() {
  const {
    events,
    calendarView,
    setCalendarView,
    setDisplayedDates,
    refreshUserEvents,
    toggleEventsView,
    eventsView,
  } = useMyCalendar();

  const { t, i18n } = useTranslation(["calendar"]);
  const localizer = momentLocalizer(moment);

  // --- MUDANÇA ESSENCIAL: ESTADO UNIFICADO PARA O MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventData | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      setEventToEdit(null); // Modo criação
      setSelectedSlot({ start, end });
      setIsModalOpen(true);
    },
    []
  );

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setEventToEdit({
      id: event.resource.id,
      title: event.title,
      start: event.start as Date,
      end: event.end as Date,
      tags: event.resource.tags || [],
      notes: event.resource.notes || "",
      color: event.resource.color,
      everyDay: event.resource.everyDay,
      everyWeek: event.resource.everyWeek,
    });
    setSelectedSlot(null);
    setIsModalOpen(true);
  }, []);

  const [isWideScreen, setIsWideScreen] = useState(window.innerWidth > 400);

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth > 400);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
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
    [setDisplayedDates]
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
      <EventModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        refreshUserEvents={refreshUserEvents}
        eventToEdit={eventToEdit}
        initialStartDate={selectedSlot?.start}
        initialEndDate={selectedSlot?.end}
      />
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
            if (
              colorFromPickerOrBackend &&
              colorFromPickerOrBackend !== "#3399FF"
            ) {
              effectiveColor = colorFromPickerOrBackend;
            } else if (inferredTagColor) {
              effectiveColor = inferredTagColor;
            } else if (colorFromPickerOrBackend) {
              effectiveColor = colorFromPickerOrBackend;
            } else {
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
