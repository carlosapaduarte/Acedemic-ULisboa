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

      {/* 2. CARTÕES DE RESUMO (TOPO) */}
      {/* Passamos os dados corretos que carregámos no estado */}
      <SummaryCards
        tasks={tasks}
        moodHistory={moodHistory}
        focusStats={distStats}
      />

      <div className={styles.statsContainerPage}>
        {/* 1. PAINEL DE ENERGIA */}
        <EnergyStats />

        {/* 2. PAINEL DE TAREFAS */}
        {/* Este componente já tem altura fixa e largura total */}
        <TasksStats tasks={tasks} />

        {/* 3. FOCUS STATS (Pomodoro) */}
        {/* Remover a div envolvente. O componente já tem margens e bordas próprias */}
        <FocusStats />

        {/* 4. DRILL DOWN (Tags UCs vs Lifestyle) */}
        {/* Remover a div envolvente para ter espaço para os dois gráficos */}
        <DrillDownStats />
      </div>
    </RequireAuthn>
  );
}
