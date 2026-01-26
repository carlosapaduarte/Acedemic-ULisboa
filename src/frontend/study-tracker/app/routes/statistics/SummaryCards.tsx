import React, { useMemo } from "react";
import styles from "./statistics.module.css";
import {
  Task,
  DailyEnergyStatus,
  TaskDistributionPerWeek,
} from "~/service/service";
import { utils } from "~/utils";

interface SummaryProps {
  tasks: Task[];
  moodHistory: DailyEnergyStatus[];
  focusStats: TaskDistributionPerWeek[];
}

export function SummaryCards({ tasks, moodHistory, focusStats }: SummaryProps) {
  const stats = useMemo(() => {
    // Obter data de hoje para referência
    const today = new Date();
    const currentWeek = utils.getWeekNumber(today);
    const currentYear = today.getFullYear();

    // 1. Tempo de Foco (Semana Atual)
    const weeklyFocusMinutes = focusStats
      .filter((s) => s.week === currentWeek)
      .reduce((acc, curr) => acc + curr.time, 0);

    const hours = Math.floor(weeklyFocusMinutes / 60);
    const mins = weeklyFocusMinutes % 60;
    const focusText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    // 2. Tarefas Completas (APENAS ESTA SEMANA)
    const tasksDone = tasks.filter((t) => {
      const data = t.data || (t as any);

      // Verificar se está concluída
      const isCompleted = data.status === "completed";

      // Verificar data de conclusão
      const completedAtStr = data.completed_at;

      if (!isCompleted || !completedAtStr) return false;

      const completedDate = new Date(completedAtStr);

      // A tarefa conta se:
      // a) A semana da conclusão for igual à semana atual
      // b) O ano for o mesmo (para evitar bugs na mesma semana de anos diferentes)
      return (
        utils.getWeekNumber(completedDate) === currentWeek &&
        completedDate.getFullYear() === currentYear
      );
    }).length;

    // 3. REGISTOS DE HUMOR (Esta Semana)
    const logsCount = moodHistory.filter((m) => {
      if (m.level === null) return false;

      const logDate = new Date(m.date);
      // Garante semana e ano
      return (
        utils.getWeekNumber(logDate) === currentWeek &&
        logDate.getFullYear() === currentYear
      );
    }).length;

    // 4. Blocos/Eventos (Esta Semana)
    const eventsCount = focusStats.filter((s) => s.week === currentWeek).length;

    return { focusText, tasksDone, logsCount, eventsCount };
  }, [tasks, moodHistory, focusStats]);

  return (
    <div className={styles.summaryGrid}>
      {/* Card 1: Foco */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryIcon}>⏱️</div>
        <div className={styles.summaryValue}>{stats.focusText}</div>
        <div className={styles.summaryLabel}>Foco esta Semana</div>
      </div>

      {/* Card 2: Tarefas (Atualizado) */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryIcon}>✅</div>
        <div className={styles.summaryValue}>{stats.tasksDone}</div>
        <div className={styles.summaryLabel}>
          Tarefas Concluídas esta Semana
        </div>
      </div>

      {/* Card 3: Registos */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryIcon}>📝</div>
        <div className={styles.summaryValue}>{stats.logsCount}</div>
        <div className={styles.summaryLabel}>
          Apontamentos criados esta Semana
        </div>
      </div>

      {/* Card 4: Eventos */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryIcon}>📅</div>
        <div className={styles.summaryValue}>{stats.eventsCount}</div>
        <div className={styles.summaryLabel}>Eventos nesta Semana</div>
      </div>
    </div>
  );
}
