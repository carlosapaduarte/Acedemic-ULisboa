import { Messages } from "react-big-calendar";
import { useTranslation } from "react-i18next";

export function getCalendarMessages(): Messages {
  const { t } = useTranslation("calendar");

  return {
    date: t("date"),
    time: t("time"),
    event: t("event"),
    allDay: t("allDay"),
    week: t("week"),
    work_week: t("work_week"),
    day: t("day"),
    month: t("month"),
    previous: t("prev_month_but"),
    next: t("next_month_but"),
    today: t("today"),
    agenda: t("agenda"),
    noEventsInRange: t("no_events_in_range"),
    showMore: (total) => t("show_more", { count: total }),
  };
}
