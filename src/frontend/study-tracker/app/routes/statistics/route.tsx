import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  service,
  Task,
  DailyEnergyStatus,
  Event,
  WeekTimeStudy,
} from "~/service/service";
import styles from "./statistics.module.css";
import { RequireAuthn } from "~/components/auth/RequireAuthn";
import { TasksStats } from "./TasksStats";
import { EnergyStats } from "./Energy";
import { FocusStats } from "./FocusStats";
import { SummaryCards } from "./SummaryCards";
import { DrillDownStats } from "./DrillDownStats";

export default function Statistics() {
  const { t } = useTranslation(["statistics"]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [moodHistory, setMoodHistory] = useState<DailyEnergyStatus[]>([]);
  const [weeklyStudyTime, setWeeklyStudyTime] = useState<WeekTimeStudy[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [allTasks, moodData, studyTime, allEvents] = await Promise.all([
          service.getTasks(false),
          service.fetchEnergyHistory(),
          service.getStudyTimeByWeek(),
          service.getAllUserEvents(),
        ]);

        setTasks(allTasks);
        setMoodHistory(moodData);
        setWeeklyStudyTime(studyTime);
        setEvents(allEvents);
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      }
    }
    loadData();
  }, []);

  return (
    <RequireAuthn>
      {/* 1. TÍTULO */}
      <div className={styles.pageTitleDiv}>
        <span className={styles.pageTitle}>{t("statistics:title")}</span>
      </div>

      {/* 2. CARTÕES DE RESUMO (TOPO)*/}
      <div className="tutorial-target-stats-summary" style={{ width: "100%" }}>
        <SummaryCards
          tasks={tasks}
          moodHistory={moodHistory}
          weeklyStudyTime={weeklyStudyTime}
          events={events}
        />
      </div>

      <div className={styles.statsContainerPage}>
        {/* 1. PAINEL DE ENERGIA */}
        <div className="tutorial-target-stats-energy" style={{ width: "100%" }}>
          <EnergyStats />
        </div>

        {/* 2. PAINEL DE TAREFAS */}
        <div className="tutorial-target-stats-tasks" style={{ width: "100%" }}>
          <TasksStats tasks={tasks} />
        </div>

        {/* 3. FOCUS STATS (Pomodoro) */}
        <div className="tutorial-target-stats-focus" style={{ width: "100%" }}>
          <FocusStats weeklyStudyTime={weeklyStudyTime} />
        </div>

        {/* 4. DRILL DOWN */}
        <div
          className="tutorial-target-stats-drilldown"
          style={{ width: "100%" }}
        >
          <DrillDownStats />
        </div>
      </div>
    </RequireAuthn>
  );
}
