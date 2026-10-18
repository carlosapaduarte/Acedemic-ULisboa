import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import styles from "./statistics.module.css";
import { Task } from "~/service/service";
import { useTranslation } from "react-i18next";
import { FaBed, FaBolt, FaChartLine, FaBullseye, FaCircleCheck } from "react-icons/fa6";

const COLORS = {
  bar: "#4CAF50",
  axis: "#5d4037", // var(--color-2)
  prioHigh: "#F44336", // Vermelho
  prioMedium: "#FF9800", // Laranja
  prioLow: "#4CAF50", // Verde
};

function calculateDetailedInsights(
  totalCompleted: number,
  activeDaysCount: number,
  priorityBreakdown: { high: number; med: number; low: number },
) {
  if (totalCompleted === 0) return { type: "neutral", titleKey: "no_data_recent_title", icon: FaBed, textKey: "no_data_recent_text" };
  if (activeDaysCount <= 2 && totalCompleted > 3) return { type: "warning", titleKey: "productivity_bursts_title", icon: FaBolt, textKey: "productivity_bursts_text", values: { total: totalCompleted, days: activeDaysCount } };
  if (activeDaysCount >= 4) return { type: "success", titleKey: "consistent_pace_title", icon: FaChartLine, textKey: "consistent_pace_text" };
  if (priorityBreakdown.high > priorityBreakdown.low + priorityBreakdown.med) return { type: "success", titleKey: "essential_focus_title", icon: FaBullseye, textKey: "essential_focus_text" };
  return { type: "neutral", titleKey: "tasks_on_track_title", icon: FaCircleCheck, textKey: "tasks_on_track_text", values: { total: totalCompleted } };
}

// --- COMPONENTE PRINCIPAL ---
export function TasksStats({ tasks }: { tasks: Task[] }) {
  const { t, i18n } = useTranslation(["statistics"]);
  const locale = i18n.language.startsWith("en") ? "en-GB" : "pt-PT";

  // Processamento de Dados
  const { barData, pieData, totalCompleted, activeDays, priorities } =
    useMemo(() => {
      // 1. Preparar últimos 7 dias
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d;
      }).reverse();

      const groupedBar: Record<string, number> = {};
      last7Days.forEach((d) => {
        const key = `${d.getDate()} ${d
          .toLocaleString(locale, { month: "short" })
          .replace(".", "")}`;
        groupedBar[key] = 0;
      });

      let completedCount = 0;
      let activeDaysCount = 0; // Dias em que houve pelo menos 1 tarefa feita
      const prioCount = { high: 0, med: 0, low: 0 };

      // 2. Iterar tarefas
      tasks.forEach((task) => {
        const status = task.data?.status || (task as any).status;
        const completedAt =
          task.data?.completed_at || (task as any).completed_at;
        const prio = (
          task.data?.priority ||
          (task as any).priority ||
          "low"
        ).toLowerCase();

        if (status === "completed" && completedAt) {
          const date = new Date(completedAt);
          // Verifica se está no range dos 7 dias
          const dayDiff = Math.floor(
            (new Date().getTime() - date.getTime()) / (1000 * 3600 * 24),
          );

          if (dayDiff < 7 && dayDiff >= 0) {
            const key = `${date.getDate()} ${date
              .toLocaleString(locale, { month: "short" })
              .replace(".", "")}`;
            if (groupedBar[key] !== undefined) {
              groupedBar[key]++;
              completedCount++;

              // Contagem de prioridades
              if (prio === "high") prioCount.high++;
              else if (prio === "medium") prioCount.med++;
              else prioCount.low++;
            }
          }
        }
      });

      // Calcular dias ativos
      Object.values(groupedBar).forEach((count) => {
        if (count > 0) activeDaysCount++;
      });

      // Formatar dados para gráficos
      const barChartData = Object.keys(groupedBar).map((key) => ({
        name: key,
        tarefas: groupedBar[key],
      }));

      const pieChartData = [
        { name: t("priority_high"), value: prioCount.high, color: COLORS.prioHigh },
        { name: t("priority_medium"), value: prioCount.med, color: COLORS.prioMedium },
        { name: t("priority_low"), value: prioCount.low, color: COLORS.prioLow },
      ].filter((d) => d.value > 0); // Só mostra o que tem dados

      return {
        barData: barChartData,
        pieData: pieChartData,
        totalCompleted: completedCount,
        activeDays: activeDaysCount,
        priorities: prioCount,
      };
    }, [tasks, locale, t]);

  const insight = calculateDetailedInsights(
    totalCompleted,
    activeDays,
    priorities,
  );

  return (
    <div className={styles.statCardContainer}>
      <div className={styles.statTitle}>
        <img
          src="/icons/task_progress_icon.svg"
            alt={t("task_progress_icon_alt")}
          style={{ height: "1.2em" }}
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
        {t("task_performance")}
      </div>

      <div className={styles.tasksGrid}>
        {/* GRÁFICO 1: BARRAS (VOLUME) */}
        <div className={styles.chartWrapper}>
          <div className={styles.chartTitleSmall}>{t("tasks_per_day")}</div>
          {totalCompleted > 0 ? (
            <div style={{ width: "100%", height: 180, fontSize: "0.65rem" }}>
              <ResponsiveContainer>
                <BarChart
                  data={barData}
                  margin={{ top: 10, right: 0, left: -25, bottom: 0 }}
                >
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: COLORS.axis, fontWeight: "bold" }}
                    interval={0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: COLORS.axis }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: `2px solid ${COLORS.axis}`,
                    }}
                  />
                  <Bar dataKey="tarefas" radius={[4, 4, 0, 0]} barSize={20}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.bar} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ color: "#999", fontSize: "0.8rem" }}>
              {t("no_completed_tasks")}
            </div>
          )}
        </div>

        {/* GRÁFICO 2: DONUT (PRIORIDADE) */}
        <div className={styles.chartWrapper}>
          <div className={styles.chartTitleSmall}>{t("by_priority")}</div>
          {pieData.length > 0 ? (
            <>
              <div style={{ width: "100%", height: 160 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: `2px solid ${COLORS.axis}`,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.customLegend}>
                {pieData.map((p, i) => (
                  <div key={i} className={styles.legendItem}>
                    <div
                      className={styles.legendDot}
                      style={{ backgroundColor: p.color }}
                    />
                    {p.name} ({p.value})
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ color: "#999", fontSize: "0.8rem" }}>{t("no_data_short")}</div>
          )}
        </div>
      </div>

      {insight && (
        <div
          className={styles.insightCard}
          style={{
            borderLeftColor:
              insight.type === "success"
                ? "#4CAF50"
                : insight.type === "warning"
                ? "#FF9800"
                : "#2196F3",
            marginTop: "1rem",
          }}
        >
          <div
            className={styles.insightTitle}
            style={{
              color:
                insight.type === "success"
                  ? "#2E7D32"
                  : insight.type === "warning"
                  ? "#E65100"
                  : "#1565C0",
            }}
          >
            {React.createElement(insight.icon)} {t(insight.titleKey)}
          </div>
          <div
            className={styles.insightContent}
            style={{ fontSize: "0.9rem", fontWeight: "normal" }}
          >
            {t(insight.textKey, insight.values)}
          </div>
        </div>
      )}
    </div>
  );
}
