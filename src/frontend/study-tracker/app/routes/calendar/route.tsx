import {
  Calendar,
  Event as CalendarEvent,
  momentLocalizer,
  View,
  Views,
} from "react-big-calendar";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { Event, service, Tag } from "~/service/service";

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

interface CalendarEventResource {
  id: number;
  tags?: string[];
  everyWeek?: boolean;
  everyDay?: boolean;
  color?: string;
  originalStartDate?: Date;
  originalEndDate?: Date;
  notes?: string;
  style?: React.CSSProperties;
}

const EventWithTags = ({
  event,
  allUserTags,
  style,
}: {
  event: CalendarEvent & { resource: CalendarEventResource };
  allUserTags: Tag[];
  style?: React.CSSProperties;
}) => {
  const isRecurring = event.resource.everyWeek || event.resource.everyDay;
  const getTagNames = () => {
    if (!event.resource.tags || allUserTags.length === 0) return [];
    return event.resource.tags!.map((tagIdentifier: string | number) => {
      const foundTag: Tag | undefined = allUserTags.find(
        (tag: Tag) => tag.id === tagIdentifier || tag.name === tagIdentifier
      );
      return foundTag ? foundTag.name : tagIdentifier;
    });
  };
  const tagNames = getTagNames();

  const combinedStyle: React.CSSProperties = {
    ...style,
    width: "100%",
    height: "100%",
    borderRadius: "6px",
    overflow: "hidden",
    color: "white",
    display: "flex",
  };

  const innerWrapperStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    padding: "4px",
    height: "100%",
    width: "100%",
  };

  const titleStyle: React.CSSProperties = {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  };

  const tagsChipStyle: React.CSSProperties = {
    fontSize: "0.7em",
    background: "rgba(0,0,0,0.25)",
    padding: "3px 8px",
    borderRadius: "10px",
    zIndex: 2,
    display: "flex",
    alignItems: "center",
    gap: "5px",
    marginTop: "4px",
    alignSelf: "flex-start",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    maxWidth: "100%",
  };

  return (
    <div style={combinedStyle}>
      <div style={innerWrapperStyle}>
        <div style={titleStyle}>{event.title}</div>

        {(tagNames.length > 0 || isRecurring) && (
          <div style={tagsChipStyle}>
            {isRecurring && (
              <span
                title="Evento Recorrente"
                style={{ display: "flex", alignItems: "center" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="16px"
                  viewBox="0 -960 960 960"
                  width="16px"
                  fill="#e3e3e3"
                >
                  <path d="M280-80 120-240l160-160 56 58-62 62h406v-160h80v240H274l62 62-56 58Zm-80-440v-240h486l-62-62 56-58 160 160-160 160-56-58 62-62H280v160h-80Z" />
                </svg>
              </span>
            )}
            {tagNames.length > 0 && <span>{tagNames.join(", ")}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

const getEventStyleProps = (
  event: Event,
  allUserTags: Tag[]
): React.CSSProperties => {
  const FALLBACK_COLOR = "#3399FF";

  //1º prioridade: cor personalizada definida no evento.
  if (event.color && event.color !== FALLBACK_COLOR) {
    return { backgroundColor: event.color };
  }

  //2º Procurar cores nas tags associadas
  const tagIdentifiers = event.tags || [];
  if (tagIdentifiers.length > 0 && allUserTags.length > 0) {
    const associatedTags = allUserTags.filter(
      (tag) =>
        tagIdentifiers.includes(tag.id) || tagIdentifiers.includes(tag.name)
    );

    const colors = associatedTags
      .map((tag) => tag.color)
      .filter(Boolean) as string[];

    //Se só houver uma cor, usa cor sólida
    if (colors.length === 1) {
      return { backgroundColor: colors[0] };
    }

    //Se houver várias cores, cria um gradiente
    if (colors.length > 1) {
      const gradient = `linear-gradient(45deg, ${colors.join(",")})`;
      return { backgroundImage: gradient };
    }
  }

  //fallback
  return { backgroundColor: FALLBACK_COLOR };
};

type EventsView = "allEvents" | "recurringEvents";

function useMyCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [userTags, setUserTags] = useState<Tag[]>([]);
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

  const refreshAllCalendarData = useCallback(async () => {
    try {
      const [eventsFromBackend, tagsFromBackend] = await Promise.all([
        service.getAllUserEvents(),
        service.fetchUserTags(),
      ]);
      setUserTags(tagsFromBackend);
      const allOccurrences: CalendarEvent[] = [];
      eventsFromBackend.forEach((event) => {
        const styleProps = getEventStyleProps(event, tagsFromBackend);

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
                style: styleProps,
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
    } catch (error) {
      console.error("Falha ao carregar dados do calendário:", error);
    }
  }, [displayedDates]);

  useEffect(() => {
    refreshAllCalendarData();
  }, [eventsView, displayedDates, refreshAllCalendarData]);
  useEffect(() => {
    if (calendarView === Views.MONTH) setEventsView("allEvents");
  }, [calendarView]);
  function toggleEventsView() {
    if (eventsView === "allEvents") setEventsView("recurringEvents");
    else setEventsView("allEvents");
  }

  return {
    events,
    userTags,
    calendarView,
    setCalendarView,
    eventsView,
    setDisplayedDates,
    refreshUserEvents: refreshAllCalendarData,
    toggleEventsView,
  };
}

const AgendaEvent = ({
  event,
  allUserTags,
}: {
  event: any;
  allUserTags: Tag[];
}) => {
  const eventStyle = event.resource?.style || {};

  const dotColor = eventStyle.backgroundColor || "#3399FF";

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          backgroundColor: dotColor,
          marginRight: "8px",
        }}
      />
      <div>{event.title}</div>
    </div>
  );
};

function MyCalendar() {
  const {
    events,
    userTags,
    calendarView,
    setCalendarView,
    setDisplayedDates,
    refreshUserEvents,
    toggleEventsView,
    eventsView,
  } = useMyCalendar();
  const { t, i18n } = useTranslation(["calendar"]);
  const localizer = momentLocalizer(moment);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventData | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      setEventToEdit(null);
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
        while (curDate <= range.end) {
          dates.push(new Date(curDate));
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
            agenda: {
              event: (props) => (
                <AgendaEvent {...props} allUserTags={userTags} />
              ),
            },
            event: (props) => (
              <EventWithTags {...props} allUserTags={userTags} />
            ),
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
            const baseStyle: React.CSSProperties = {
              borderRadius: "5px",
              color: "white",
              border: "none",
            };
            const finalStyle = {
              ...baseStyle,
              ...event.resource?.style,
            };

            if (calendarView === Views.AGENDA) {
              finalStyle.backgroundColor = "transparent";
              finalStyle.backgroundImage = "none";
              finalStyle.color = "inherit";
            }
            return { style: finalStyle };
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
