import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  service,
  Task,
  TaskDistributionPerWeek,
  DailyEnergyStatus,
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
  const [distStats, setDistStats] = useState<TaskDistributionPerWeek[]>([]);
  const [moodHistory, setMoodHistory] = useState<DailyEnergyStatus[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [allTasks, dist, moodData] = await Promise.all([
          service.getTasks(false),
          service.getTaskDistributionStats(),
          service.fetchEnergyHistory(),
        ]);

        setTasks(allTasks);
        setDistStats(dist);
        setMoodHistory(moodData);
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

      {/* 2. CARTÕES DE RESUMO (TOPO) - ADICIONÁMOS A CLASSE AQUI */}
      <div className="tutorial-target-stats-summary" style={{ width: "100%" }}>
        <SummaryCards
          tasks={tasks}
          moodHistory={moodHistory}
          focusStats={distStats}
        />
      </div>

      <div className={styles.statsContainerPage}>
        {/* 1. PAINEL DE ENERGIA (Já estava certo) */}
        <div className="tutorial-target-stats-energy" style={{ width: "100%" }}>
          <EnergyStats />
        </div>

        {/* 2. PAINEL DE TAREFAS (Já estava certo) */}
        <div className="tutorial-target-stats-tasks" style={{ width: "100%" }}>
          <TasksStats tasks={tasks} />
        </div>

        {/* 3. FOCUS STATS (Pomodoro) (Já estava certo) */}
        <div className="tutorial-target-stats-focus" style={{ width: "100%" }}>
          <FocusStats />
        </div>

        {/* 4. DRILL DOWN - ADICIONÁMOS A CLASSE AQUI */}
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
