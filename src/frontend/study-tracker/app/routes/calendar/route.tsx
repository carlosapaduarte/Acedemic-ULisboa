import {
  Calendar,
  Event as CalendarEvent,
  momentLocalizer,
  View,
  Views,
} from "react-big-calendar";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { Event, service, Tag, Task } from "~/service/service";
import { FaListCheck } from "react-icons/fa6";
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
  task_id?: number;
  is_uc?: boolean;
}

const EventWithTags = ({
  event,
  allUserTags,
  allTasks,
  style,
}: {
  event: CalendarEvent & { resource?: CalendarEventResource };
  allUserTags: Tag[];
  allTasks: Task[];
  style?: React.CSSProperties;
}) => {
  const { t, i18n } = useTranslation(["calendar"]);
  const isRecurring = event.resource.everyWeek || event.resource.everyDay;

  const getTagNames = () => {
    if (!event.resource.tags || allUserTags.length === 0) return [];
    return event.resource.tags!.map((tagIdentifier: string | number) => {
      const foundTag: Tag | undefined = allUserTags.find(
        (tag: Tag) =>
          tag.id === tagIdentifier ||
          tag.name_pt === tagIdentifier ||
          tag.name_en === tagIdentifier
      );

      if (!foundTag) {
        return String(tagIdentifier);
      }

      if (
        foundTag.name &&
        ["fun", "work", "personal", "study"].includes(foundTag.name)
      ) {
        return t(`tags:${foundTag.name}`);
      }

      const lang = i18n.language.toLowerCase();
      if (lang.startsWith("pt") && foundTag.name_pt) {
        return foundTag.name_pt;
      }
      if (lang.startsWith("en") && foundTag.name_en) {
        return foundTag.name_en;
      }

      return foundTag.name_pt || foundTag.name_en || tagIdentifier;
    });
  };
  const tagNames = getTagNames();

  let isCompletedTaskSlot = false;
  const taskId = event.resource?.task_id;

  if (taskId && allTasks) {
    const associatedTask = allTasks.find((t) => t.id === taskId);
    if (associatedTask && associatedTask.data.status === "completed") {
      isCompletedTaskSlot = true;
    }
  }

  const applyPastStyle = taskId && isCompletedTaskSlot;

  const combinedStyle: React.CSSProperties = {
    ...style,
    width: "100%",
    height: "100%",
    borderRadius: "6px",
    overflow: "hidden",
    color: "white",
    display: "flex",
    opacity: applyPastStyle ? 0.6 : 1,
    textDecoration: applyPastStyle ? "line-through" : "none",
  };

  const innerWrapperStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    padding: "4px",
    height: "100%",
    width: "100%",
    overflow: "hidden",
  };

  const titleStyle: React.CSSProperties = {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    marginBottom: "2px",
    flexShrink: 0,
  };

  const tagsChipStyle: React.CSSProperties = {
    fontSize: "0.75em",
    background: "rgba(0,0,0,0.25)",
    padding: "2px 6px",
    borderRadius: "10px",
    zIndex: 2,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "auto",
    alignSelf: "flex-start",
    maxWidth: "100%",
    overflow: "hidden",
  };

  const tagTextStyle: React.CSSProperties = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    minWidth: 0,
    flex: 1,
  };

  const iconStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  };

  const isWorkSlot = !!taskId;

  return (
    <div style={combinedStyle}>
      <div style={innerWrapperStyle}>
        <div style={titleStyle} title={event.title}>
          {event.title}
        </div>

        {(tagNames.length > 0 || isRecurring || isWorkSlot) && (
          <div style={tagsChipStyle}>
            {isRecurring && (
              <span title="Evento Recorrente" style={iconStyle}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="12px"
                  viewBox="0 -960 960 960"
                  width="12px"
                  fill="#e3e3e3"
                >
                  <path d="M280-80 120-240l160-160 56 58-62 62h406v-160h80v240H274l62 62-56 58Zm-80-440v-240h486l-62-62 56-58 160 160-160 160-56-58 62-62H280v160h-80Z" />
                </svg>
              </span>
            )}

            {isWorkSlot && (
              <span title="Slot de Trabalho" style={iconStyle}>
                <FaListCheck size={12} color="#e3e3e3" />
              </span>
            )}

            {tagNames.length > 0 && (
              <span style={tagTextStyle} title={tagNames.join(", ")}>
                {tagNames.join(", ")}
              </span>
            )}
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
        (tag.name_pt && tagIdentifiers.includes(tag.name_pt)) ||
        (tag.name_en && tagIdentifiers.includes(tag.name_en))
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
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [calendarView, setCalendarView] = useState<View>(Views.WEEK);
  const [eventsView, setEventsView] = useState<EventsView>("allEvents");
  const { i18n } = useTranslation();
  const [displayedDates, setDisplayedDates] = useState<Date[]>([]);

  useEffect(() => {
    const lang = i18n.language.toLowerCase();
    const localeToSet = lang.startsWith("pt") ? "pt" : "en";

    if (localeToSet === "pt") {
      moment.updateLocale("pt", {
        months: [
          "Janeiro",
          "Fevereiro",
          "Março",
          "Abril",
          "Maio",
          "Junho",
          "Julho",
          "Agosto",
          "Setembro",
          "Outubro",
          "Novembro",
          "Dezembro",
        ],
        monthsShort: [
          "Jan",
          "Fev",
          "Mar",
          "Abr",
          "Mai",
          "Jun",
          "Jul",
          "Ago",
          "Set",
          "Out",
          "Nov",
          "Dez",
        ],
        weekdays: [
          "Domingo",
          "Segunda-feira",
          "Terça-feira",
          "Quarta-feira",
          "Quinta-feira",
          "Sexta-feira",
          "Sábado",
        ],
        weekdaysShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
        weekdaysMin: ["D", "S", "T", "Q", "Q", "S", "S"],
        longDateFormat: {
          LT: "HH:mm",
          LTS: "HH:mm:ss",
          L: "DD/MM/YYYY",
          LL: "D [de] MMMM [de] YYYY",
          LLL: "D [de] MMMM [de] YYYY HH:mm",
          LLLL: "dddd, D [de] MMMM [de] YYYY HH:mm",
        },
        week: { dow: 1 }, //começa na segunda-feira
      });
    } else {
      moment.updateLocale("en", { week: { dow: 1 } });
    }
    moment.locale(localeToSet);

    const startOfWeek = moment().startOf("week").toDate();
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(moment(startOfWeek).add(i, "days").toDate());
    }
    setDisplayedDates(dates);
  }, [i18n.language]);

  const refreshAllCalendarData = useCallback(async () => {
    try {
      const [eventsFromBackend, tagsFromBackend, tasksFromBackend] =
        await Promise.all([
          service.getAllUserEvents(),
          service.fetchUserTags(),
          service.getTasks(false), //Vai buscar TODAS as tarefas (concluídas ou não)
        ]);

      setUserTags(tagsFromBackend);
      setAllTasks(tasksFromBackend);

      let allOccurrences: CalendarEvent[] = [];
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
                task_id: event.task_id,
                is_uc: event.is_uc,
              } as CalendarEventResource,
            });
          }
        });
      });

      const filteredOccurrences = allOccurrences.filter((event) => {
        if (eventsView === "recurringEvents") {
          const resource = event.resource as CalendarEventResource;
          return resource.everyDay || resource.everyWeek;
        }
        return true; // Se for 'allEvents', mantém todos
      });

      const uniqueEventsMap = new Map<string, CalendarEvent>();
      filteredOccurrences.forEach((ev) => {
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
  }, [displayedDates, eventsView, i18n.language]);

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
    allTasks,
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
  const FALLBACK_COLOR = "#3399FF";
  let colorDots: string[] = [];

  // 1. Verifica se há cor personalizada para o evento
  const customColor = event.resource?.color;

  if (customColor && customColor !== FALLBACK_COLOR) {
    colorDots = [customColor];
  } else {
    // 2. Se não há cor personalizada, procura as cores das etiquetas
    const tagIdentifiers = event.resource?.tags || [];

    if (tagIdentifiers.length > 0 && allUserTags.length > 0) {
      // Compara os nomes da lista de tags com os da lista de 'allUserTags'
      const associatedTags = allUserTags.filter(
        (tag) =>
          (tag.name_pt && tagIdentifiers.includes(tag.name_pt)) ||
          (tag.name_en && tagIdentifiers.includes(tag.name_en)) ||
          (tag.name && tagIdentifiers.includes(tag.name))
      );

      const tagColors = associatedTags
        .map((tag) => tag.color)
        .filter(Boolean) as string[];

      if (tagColors.length > 0) {
        colorDots = tagColors;
      }
    }
  }

  // 3. Fallback se nenhuma cor foi encontrada
  if (colorDots.length === 0) {
    colorDots = [FALLBACK_COLOR];
  }

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {colorDots.map((color, index) => (
        <div
          key={index}
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: color,
            //marginRight: "4px",
            marginLeft: index > 0 ? "4px" : "0",
          }}
        />
      ))}
      <div style={{ marginLeft: "8px" }}>{event.title}</div>
    </div>
  );
};

function MyCalendar() {
  const {
    events,
    userTags,
    allTasks,
    calendarView,
    setCalendarView,
    setDisplayedDates,
    refreshUserEvents,
    toggleEventsView,
    eventsView,
  } = useMyCalendar();
  const { t, i18n } = useTranslation(["calendar"]);
  const [viewMode, setViewMode] = useState<"all" | "classes_only">("all");

  useEffect(() => {
    refreshUserEvents();
  }, [i18n.language, refreshUserEvents]);

  const localizer = React.useMemo(
    () => momentLocalizer(moment),
    [i18n.language]
  );

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
      is_uc: event.resource.is_uc || false,
    });
    setSelectedSlot(null);
    setIsModalOpen(true);
  }, []);

  const handleCreateEventClick = () => {
    setEventToEdit(null);
    setSelectedSlot(null);
    setIsModalOpen(true);
  };

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

  const filteredEvents = React.useMemo(() => {
    if (viewMode === "classes_only") {
      // Filtra SÓ os eventos que têm 'is_uc: true'
      return events.filter(
        (event) => (event.resource as CalendarEventResource)?.is_uc
      );
    }
    return events; // Se for 'all', retorna todos
  }, [events, viewMode]);

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

      <div className={styles.calendarHeaderActions}>
        {calendarView !== Views.MONTH ? (
          <button onClick={toggleEventsView} className={styles.toggleButton}>
            {eventsView === "allEvents" ? (
              <span>{t("display_only_recurring_events_button")}</span>
            ) : (
              <span>{t("display_all_events_button")}</span>
            )}
          </button>
        ) : (
          <div></div>
        )}
        <button
          onClick={() =>
            setViewMode(viewMode === "all" ? "classes_only" : "all")
          }
          className={styles.toggleButton}
        >
          {viewMode === "all" ? t("Ver só Aulas") : t("Ver Todos os Eventos")}
        </button>
        <button
          className={styles.toggleButton}
          onClick={handleCreateEventClick}
        >
          {t("create_event_button")}
        </button>
      </div>

      <div className={styles.calendarContainer}>
        <Calendar
          key={i18n.language}
          components={{
            agenda: {
              event: (props) => (
                <AgendaEvent {...props} allUserTags={userTags} />
              ),
            },
            event: React.useMemo(
              () => (props: any) =>
                (
                  <EventWithTags
                    {...props}
                    allUserTags={userTags}
                    allTasks={allTasks}
                  />
                ),
              [i18n.language, userTags, allTasks]
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
          scrollToTime={new Date(2000, 1, 1, 7)}
          events={filteredEvents}
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
            const now = new Date();
            const eventEndDate = new Date(event.end as Date);
            const isPastEvent = eventEndDate < now;

            let isCompletedTaskSlot = false;
            const taskId = event.resource?.task_id;

            if (taskId && allTasks) {
              const associatedTask = allTasks.find((t) => t.id === taskId);
              if (
                associatedTask &&
                associatedTask.data.status === "completed"
              ) {
                isCompletedTaskSlot = true;
              }
            }

            const applyFadedStyle = taskId && isCompletedTaskSlot;

            const baseStyle: React.CSSProperties = {
              borderRadius: "5px",
              color: "white",
              border: "none",
            };

            const colorStyle = getEventStyleProps(event, userTags);

            const finalStyle = {
              ...baseStyle,
              ...event.resource?.style,
            };

            if (applyFadedStyle) {
              finalStyle.opacity = 0.5;

              finalStyle.textDecoration = "line-through";
              finalStyle.textDecorationThickness = "2px";
            }

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
