import React, { useMemo } from "react";
import styles from "./statistics.module.css";
import {
  Task,
  DailyEnergyStatus,
  Event,
  WeekTimeStudy,
} from "~/service/service";
import { utils } from "~/utils";
import { useTranslation } from "react-i18next";

interface SummaryProps {
  tasks: Task[];
  moodHistory: DailyEnergyStatus[];
  weeklyStudyTime: WeekTimeStudy[];
  events: Event[];
}

function getCurrentWeekRange(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  const thursday = new Date(start);
  thursday.setDate(thursday.getDate() + 3);

  return {
    start,
    end,
    year: thursday.getFullYear(),
    week: utils.getWeekNumber(date),
  };
}

function countEventsThisWeek(events: Event[], weekStart: Date, weekEnd: Date) {
  let count = 0;

  for (const event of events) {
    if (!event.isActive) continue;

    if (!event.everyDay && !event.everyWeek) {
      const start = new Date(event.startDate);
      if (start >= weekStart && start < weekEnd) count++;
      continue;
    }

    const templateStart = new Date(event.startDate);
    const recurrenceStart = event.recurrenceStart ?? templateStart;
    for (let occurrence = new Date(weekStart); occurrence < weekEnd; occurrence.setDate(occurrence.getDate() + 1)) {
      const dayStart = new Date(occurrence);
      const dayEnd = new Date(occurrence);
      dayEnd.setHours(23, 59, 59, 999);

      if (dayEnd < recurrenceStart) continue;
      if (event.recurrenceEnd && dayStart > new Date(event.recurrenceEnd)) continue;

      if (event.everyDay || occurrence.getDay() === templateStart.getDay()) count++;
    }
  }

  return count;
}

export function SummaryCards({ tasks, moodHistory, weeklyStudyTime, events }: SummaryProps) {
  const { t } = useTranslation(["statistics"]);
  const stats = useMemo(() => {
    const today = new Date();
    const { start, end, year, week } = getCurrentWeekRange(today);

    const weeklyFocusMinutes =
      weeklyStudyTime.find((record) => record.year === year && record.week === week)?.total ?? 0;

    const hours = Math.floor(weeklyFocusMinutes / 60);
    const mins = weeklyFocusMinutes % 60;
    const focusText = hours > 0
      ? t("statistics:time_hours_minutes_short", { hours, minutes: mins })
      : t("statistics:time_minutes_short", { minutes: mins });

    const tasksDone = tasks.filter((t) => {
      const data = t.data || (t as any);
      const isCompleted = data.status === "completed";
      const completedAtStr = data.completed_at;

      if (!isCompleted || !completedAtStr) return false;

      const completedDate = new Date(completedAtStr);
      return completedDate >= start && completedDate < end;
    }).length;

    const logsCount = moodHistory.filter((m) => {
      if (m.level === null) return false;

      const logDate = new Date(m.date);
      return logDate >= start && logDate < end;
    }).length;

    const eventsCount = countEventsThisWeek(events, start, end);

    return { focusText, tasksDone, logsCount, eventsCount };
  }, [tasks, moodHistory, weeklyStudyTime, events, t]);

  return (
    <div className={styles.summaryGrid}>
      {/* Card 1: Foco */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryValue}>{stats.focusText}</div>
        <div className={styles.summaryLabel}>{t("statistics:summary_focus_week")}</div>
      </div>

      {/* Card 2: Tarefas (Atualizado) */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryValue}>{stats.tasksDone}</div>
        <div className={styles.summaryLabel}>
          {t("statistics:tasks_completed_week")}
        </div>
      </div>

      {/* Card 3: Registos */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryValue}>{stats.logsCount}</div>
        <div className={styles.summaryLabel}>
          {t("statistics:notes_created_week")}
        </div>
      </div>

      {/* Card 4: Eventos */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryValue}>{stats.eventsCount}</div>
        <div className={styles.summaryLabel}>{t("statistics:events_this_week")}</div>
      </div>
    </div>
  );
}
