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
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "./calendar.css";
import "./CreateEvent/createEventReactAriaModal.css";
import styles from "./calendarPage.module.css";
import { RequireAuthn } from "~/components/auth/RequireAuthn";
import { EventModal, EventData } from "./CreateEvent/EventModal";
import { useTranslation } from "react-i18next";
import { utils } from "~/utils";
import "moment/locale/pt";
import { getCalendarMessages } from "../../calendarUtils";
import { FaListCheck, FaFilter, FaCheck } from "react-icons/fa6";
import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  type Selection,
} from "react-aria-components";

import * as DnDModule from "react-big-calendar/lib/addons/dragAndDrop";

let DnDCalendar = Calendar;
try {
  // @ts-ignore
  const withDragAndDrop = DnDModule.default || DnDModule;
  if (typeof withDragAndDrop === "function") {
    // @ts-ignore
    DnDCalendar = withDragAndDrop(Calendar);
  }
} catch (e) {
  console.error("Erro ao inicializar DragAndDrop:", e);
}

const hexToRgba = (hex: string, alpha: number) => {
  if (!hex || !/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    return hex;
  }
  let c = hex.substring(1).split("");
  if (c.length === 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  }
  const cStr = c.join("");
  const r = parseInt(cStr.substring(0, 2), 16);
  const g = parseInt(cStr.substring(2, 4), 16);
  const b = parseInt(cStr.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

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
  recurrenceStart?: Date;
  recurrenceEnd?: Date;
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

  const start = moment(event.start);
  const end = moment(event.end);
  const durationMinutes = end.diff(start, "minutes");

  let checkIconSize = "5em";
  if (durationMinutes <= 60) {
    checkIconSize = "2em";
  } else if (durationMinutes <= 120) {
    checkIconSize = "3.5em";
  }

  const getTagNames = () => {
    if (!event.resource?.tags || allUserTags.length === 0) return [];

    return event.resource.tags!.map((tagItem: any) => {
      let foundTag: Tag | undefined;

      if (typeof tagItem === "object" && tagItem !== null) {
        foundTag = allUserTags.find((t) => t.id === tagItem.id);
        if (!foundTag) foundTag = tagItem as Tag;
      } else {
        foundTag = allUserTags.find(
          (tag: Tag) =>
            tag.id === tagItem ||
            tag.name_pt === tagItem ||
            tag.name_en === tagItem,
        );
      }

      if (!foundTag) {
        if (typeof tagItem === "object") {
          return tagItem.name_pt || tagItem.name_en || tagItem.name || "Tag";
        }
        return String(tagItem);
      }

      if (
        foundTag.name_en &&
        ["fun", "work", "personal", "study"].includes(foundTag.name_en)
      ) {
        return t(`tags:${foundTag.name_en}`);
      }

      const lang = i18n.language.toLowerCase();
      if (lang.startsWith("pt") && foundTag.name_pt) {
        return foundTag.name_pt;
      }
      if (lang.startsWith("en") && foundTag.name_en) {
        return foundTag.name_en;
      }

      return foundTag.name_pt || foundTag.name_en || String(tagItem);
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
    position: "relative",
    textDecoration: applyPastStyle ? "line-through" : "none",
  };

  const innerWrapperStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: "10%",
    padding: "4px",
    height: "100%",
    width: "100%",
    overflow: "hidden",
    zIndex: 1,
  };

  const titleStyle: React.CSSProperties = {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    marginBottom: "2px",
    flexShrink: 1,
    minHeight: 0,
    fontWeight: 500,
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
    alignSelf: "flex-start",
    maxWidth: "100%",
    overflow: "hidden",
    flexShrink: 0,
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
      {isCompletedTaskSlot && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <FaCheck
            size={checkIconSize}
            color="#00ff40"
            style={{
              opacity: 1,
              filter: "drop-shadow(0px 0px 5px rgba(0,0,0,0.5))",
              transform: "rotate(-15deg)",
            }}
          />
        </div>
      )}

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
                  height="10px"
                  viewBox="0 -960 960 960"
                  width="10px"
                  fill="#e3e3e3"
                >
                  <path d="M280-80 120-240l160-160 56 58-62 62h406v-160h80v240H274l62 62-56 58Zm-80-440v-240h486l-62-62 56-58 160 160-160 160-56-58 62-62H280v160h-80Z" />
                </svg>
              </span>
            )}

            {isWorkSlot && (
              <span title="Slot de Trabalho" style={iconStyle}>
                <FaListCheck size={10} color="#e3e3e3" />
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
  resource: CalendarEventResource | undefined,
  allUserTags: Tag[],
  isCompleted: boolean = false,
): React.CSSProperties => {
  const FALLBACK_COLOR = "#3399FF";
  const BG_OPACITY = 0.6;

  if (!resource) return { backgroundColor: FALLBACK_COLOR };

  let baseColor = FALLBACK_COLOR;
  let gradient: string | null = null;

  //1º prioridade: cor personalizada definida no evento.
  if (resource.color && resource.color !== FALLBACK_COLOR) {
    baseColor = resource.color;
  } else {
    // 2º: Cor das Tags
    const eventTags = resource.tags || [];

    const tagColors = eventTags
      .map((t: any) => {
        // A. Se for objeto vindo do backend (pode ter .color)
        if (typeof t === "object" && t !== null && t.color) {
          return t.color;
        }

        // B. Se for ID ou string, procuramos na lista global
        if (typeof t !== "object") {
          const found = allUserTags.find(
            (ut) => ut.id === t || ut.name_pt === t || ut.name_en === t,
          );
          return found?.color;
        }
        return null;
      })
      .filter((c): c is string => !!c);

    if (tagColors.length > 0) {
      baseColor = tagColors[0];
      if (tagColors.length > 1) {
        gradient = `linear-gradient(135deg, ${tagColors.join(",")})`;
      }
    }
  }

  if (isCompleted) {
    return { backgroundColor: hexToRgba(baseColor, BG_OPACITY) };
  } else {
    if (gradient) {
      return { backgroundImage: gradient };
    }
    return { backgroundColor: baseColor };
  }
};

type EventsView = "allEvents" | "recurringEvents";

function useMyCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [userTags, setUserTags] = useState<Tag[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [calendarView, setCalendarView] = useState<View>(Views.WEEK);
  const { i18n } = useTranslation(["calendar"]);
  const [displayedDates, setDisplayedDates] = useState<Date[]>(() => {
    const startOfWeek = moment().startOf("week").toDate();
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(moment(startOfWeek).add(i, "days").toDate());
    }
    return dates;
  });

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
        week: { dow: 1 },
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
  }, [i18n.language]);

  const refreshAllCalendarData = useCallback(async () => {
    try {
      const [eventsFromBackend, tagsFromBackend, tasksFromBackend] =
        await Promise.all([
          service.getAllUserEvents(),
          service.fetchUserTags(),
          service.getTasks(false),
        ]);

      setUserTags(tagsFromBackend);
      setAllTasks(tasksFromBackend);

      let allOccurrences: CalendarEvent[] = [];
      eventsFromBackend.forEach((event) => {
        const styleProps = {};

        // Se recurrenceStart existir, usa-o. Se não, usa startDate.
        const recurrenceStartDay = event.recurrenceStart
          ? new Date(event.recurrenceStart)
          : new Date(event.startDate);
        recurrenceStartDay.setHours(0, 0, 0, 0);

        const recurrenceEndDay = event.recurrenceEnd
          ? new Date(event.recurrenceEnd)
          : null;
        if (recurrenceEndDay) recurrenceEndDay.setHours(23, 59, 59, 999);

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
          }
          // Evento Recorrente (Diário ou Semanal)
          else {
            const isAfterStart = displayDay >= recurrenceStartDay;
            const isBeforeEnd =
              !recurrenceEndDay || displayDay <= recurrenceEndDay;

            if (isAfterStart && isBeforeEnd) {
              if (event.everyDay) {
                shouldAddEvent = true;
              } else if (event.everyWeek) {
                if (event.startDate.getDay() === currentDisplayDate.getDay()) {
                  shouldAddEvent = true;
                }
              }
            }

            if (shouldAddEvent) {
              eventOccurrenceStartDate.setHours(
                event.startDate.getHours(),
                event.startDate.getMinutes(),
              );
              eventOccurrenceEndDate.setHours(
                event.endDate.getHours(),
                event.endDate.getMinutes(),
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
                recurrenceStart: event.recurrenceStart,
                recurrenceEnd: event.recurrenceEnd,
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
  }, [displayedDates, i18n.language]);

  useEffect(() => {
    refreshAllCalendarData();
  }, [displayedDates, refreshAllCalendarData]);

  const onEventDrop = useCallback(
    async ({ event, start, end }: { event: any; start: Date; end: Date }) => {
      try {
        const resource = event.resource as CalendarEventResource;

        const rawTags = resource.tags || [];

        const cleanTagIds = rawTags
          .map((t: any) => {
            if (typeof t === "object" && t !== null) {
              const val = t.id || t.name_pt || t.name_en || t.name;
              return val ? String(val) : null;
            }
            return String(t);
          })
          .filter((t: any) => t !== null && t !== "null" && t !== "");

        await service.updateEvent(resource.id, {
          title: event.title,
          startDate: start,
          endDate: end,
          tags: cleanTagIds,
          everyWeek: resource.everyWeek || false,
          everyDay: resource.everyDay || false,
          notes: resource.notes || "",
          color: resource.color,
          is_uc: resource.is_uc || false,
          recurrenceStart: resource.recurrenceStart,
          recurrenceEnd: resource.recurrenceEnd,
        });
        refreshAllCalendarData();
      } catch (error) {
        console.error("Erro ao mover evento:", error);
        alert("Não foi possível mover o evento.");
      }
    },
    [refreshAllCalendarData],
  );

  const onEventResize = useCallback(
    async ({ event, start, end }: { event: any; start: Date; end: Date }) => {
      try {
        const resource = event.resource as CalendarEventResource;

        const rawTags = resource.tags || [];

        const cleanTagIds = rawTags
          .map((t: any) => {
            if (typeof t === "object" && t !== null) {
              const val = t.id || t.name_pt || t.name_en || t.name;
              return val ? String(val) : null;
            }
            return String(t);
          })
          .filter((t: any) => t !== null && t !== "null" && t !== "");

        await service.updateEvent(resource.id, {
          title: event.title,
          startDate: start,
          endDate: end,
          tags: cleanTagIds,
          everyWeek: resource.everyWeek || false,
          everyDay: resource.everyDay || false,
          notes: resource.notes || "",
          color: resource.color,
          is_uc: resource.is_uc || false,
          recurrenceStart: resource.recurrenceStart,
          recurrenceEnd: resource.recurrenceEnd,
        });
        refreshAllCalendarData();
      } catch (error) {
        console.error("Erro ao redimensionar evento:", error);
      }
    },
    [refreshAllCalendarData],
  );

  return {
    events,
    userTags,
    allTasks,
    calendarView,
    setCalendarView,
    setDisplayedDates,
    refreshUserEvents: refreshAllCalendarData,
    onEventDrop,
    onEventResize,
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

  const customColor = event.resource?.color;

  if (customColor && customColor !== FALLBACK_COLOR) {
    colorDots = [customColor];
  } else {
    const tagIdentifiers = event.resource?.tags || [];

    if (tagIdentifiers.length > 0 && allUserTags.length > 0) {
      const associatedTags = allUserTags.filter(
        (tag) =>
          (tag.name_pt && tagIdentifiers.includes(tag.name_pt)) ||
          (tag.name_en && tagIdentifiers.includes(tag.name_en)) ||
          (tag.name && tagIdentifiers.includes(tag.name)),
      );

      const tagColors = associatedTags
        .map((tag) => tag.color)
        .filter(Boolean) as string[];

      if (tagColors.length > 0) {
        colorDots = tagColors;
      }
    }
  }

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
    onEventDrop,
    onEventResize,
  } = useMyCalendar();
  const { t, i18n } = useTranslation(["calendar"]);
  const [selectedFilters, setSelectedFilters] = useState<Selection>(
    new Set([]),
  );

  const filteredEvents = React.useMemo(() => {
    if (selectedFilters === "all" || selectedFilters.size === 0) {
      return events;
    }

    return events.filter((event) => {
      const resource = event.resource as CalendarEventResource;

      if (selectedFilters.has("classes_only")) {
        const eventTags = resource.tags || [];

        const hasClassTag = eventTags.some((tagIdentifier) => {
          const foundTag = userTags.find(
            (t) =>
              t.id === tagIdentifier ||
              t.name_pt === tagIdentifier ||
              t.name_en === tagIdentifier,
          );

          const namesToCheck: string[] = [];
          if (foundTag) {
            if (foundTag.name_pt) namesToCheck.push(foundTag.name_pt);
            if (foundTag.name_en) namesToCheck.push(foundTag.name_en);
            // @ts-ignore
            if (foundTag.name) namesToCheck.push(foundTag.name);
          }
          if (typeof tagIdentifier === "string") {
            namesToCheck.push(tagIdentifier);
          }

          return namesToCheck.some((n) => {
            const lower = n.toLowerCase().trim();
            return lower === "aula" || lower === "classes";
          });
        });

        if (!hasClassTag) return false;
      }

      if (selectedFilters.has("recurring_only")) {
        if (!resource.everyDay && !resource.everyWeek) return false;
      }

      return true;
    });
  }, [events, selectedFilters, userTags]);

  useEffect(() => {
    refreshUserEvents();
  }, [i18n.language, refreshUserEvents]);

  const localizer = React.useMemo(
    () => momentLocalizer(moment),
    [i18n.language],
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
    [],
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
      recurrenceStart: event.resource.recurrenceStart,
      recurrenceEnd: event.resource.recurrenceEnd,
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
    [setDisplayedDates],
  );
  const onView = useCallback(
    (newView: View) => {
      setCalendarView(newView);
    },
    [setCalendarView],
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
      culture?: string,
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

      <div className={styles.calendarHeaderActions}>
        <MenuTrigger>
          <Button
            aria-label={t("filter_events", "Filtrar Eventos")}
            className={`${styles.filterButton} tutorial-target-calendar-filter`}
          >
            <FaFilter size={18} />
          </Button>
          <Popover className={styles.filterPopover} placement="bottom end">
            <Menu
              className={styles.filterMenu}
              selectionMode="multiple"
              selectedKeys={selectedFilters}
              onSelectionChange={setSelectedFilters}
            >
              <MenuItem id="recurring_only" className={styles.filterMenuItem}>
                {t("display_only_recurring_events_button", "Só Recorrentes")}
              </MenuItem>
              <MenuItem id="classes_only" className={styles.filterMenuItem}>
                {t("display_classes_only", "Só Aulas")}
              </MenuItem>
            </Menu>
          </Popover>
        </MenuTrigger>

        <button
          className={`${styles.toggleButton} tutorial-target-calendar-create`}
          onClick={handleCreateEventClick}
        >
          {t("create_event_button")}
        </button>
      </div>

      <div className={styles.calendarContainer}>
        {/* @ts-ignore */}
        <DnDCalendar
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
              [i18n.language, userTags, allTasks],
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
                  }`,
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
          onEventDrop={onEventDrop}
          onEventResize={onEventResize}
          resizable={true}
          eventPropGetter={(
            event: CalendarEvent & { resource?: CalendarEventResource },
          ) => {
            const now = new Date();
            const eventEndDate = new Date(event.end as Date);

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

            const applyCompletedStyle = taskId && isCompletedTaskSlot;

            const baseStyle: React.CSSProperties = {
              borderRadius: "5px",
              color: "white",
              border: "none",
            };

            const colorStyle = getEventStyleProps(
              event.resource,
              userTags,
              applyCompletedStyle,
            );

            const finalStyle = {
              ...baseStyle,
              ...event.resource?.style,
              ...colorStyle,
            };

            if (applyCompletedStyle) {
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
