import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import styles from "./statistics.module.css";
import { useTranslation } from "react-i18next";
import { FaCircleCheck, FaClock, FaFire } from "react-icons/fa6";
import {
  Task,
  TaskDistributionPerWeek,
  WeekTimeStudy,
} from "~/service/service";

const COLORS = [
  "#3399FF",
  "#4CAF50",
  "#FFC107",
  "#E91E63",
  "#9C27B0",
  "#607D8B",
];

// --- 1. GRÁFICO: Tarefas Concluídas (Últimos 7 dias) ---
export function TasksCompletedChart({ tasks }: { tasks: Task[] }) {
  const { t } = useTranslation(["statistics"]);
  const data = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    const grouped: Record<string, number> = {};
    const last7Days = new Array(7)
      .fill(0)
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d;
      })
      .reverse();

    // Inicializar os últimos 7 dias com 0
    last7Days.forEach((d) => {
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      grouped[key] = 0;
    });

    tasks.forEach((task) => {
      const status = task.data?.status || (task as any).status;
      const completedAt = task.data?.completed_at || (task as any).completed_at;

      if (status === "completed" && completedAt) {
        const date = new Date(completedAt);
        const key = `${date.getDate()}/${date.getMonth() + 1}`;
        if (grouped[key] !== undefined) {
          grouped[key]++;
        }
      }
    });

    return Object.keys(grouped).map((key) => ({
      name: key,
      tarefas: grouped[key],
    }));
  }, [tasks]);

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}><FaCircleCheck aria-hidden="true" /> {t("statistics:task_completed_chart_title")}</h3>
      <div style={{ width: "100%", height: 250, fontSize: "0.8rem" }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            />
            <Bar
              dataKey="tarefas"
              name={t("statistics:tasks_completed_label")}
              fill="#4CAF50"
              radius={[4, 4, 0, 0]}
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// --- 2. GRÁFICO: Distribuição por Cadeira/Tag (Pizza) ---
export function StudyTimePieChart({
  distributionStats,
}: {
  distributionStats: TaskDistributionPerWeek[];
}) {
  const { t } = useTranslation(["statistics"]);
  const data = useMemo(() => {
    if (!distributionStats || distributionStats.length === 0) return [];

    const grouped: Record<string, number> = {};

    // Agrupar por Tag (que representa a UC)
    distributionStats.forEach((stat) => {
      grouped[stat.tag] = (grouped[stat.tag] || 0) + stat.time;
    });

    return Object.keys(grouped)
      .map((key) => ({
        name: key,
        value: Math.round(grouped[key]), // Minutos
      }))
      .filter((item) => item.value > 0);
  }, [distributionStats]);

  if (data.length === 0)
    return (
      <div className={styles.noData}>{t("statistics:no_study_data_week")}</div>
    );

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}><FaClock aria-hidden="true" /> {t("statistics:time_by_subject")}</h3>
      <div style={{ width: "100%", height: 250, fontSize: "0.8rem" }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [`${value} ${t("statistics:minute_short")}`, t("statistics:time_label")]} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// --- 3. GRÁFICO: Foco vs Meta (Histórico Semanal) ---
export function FocusHistoryChart({
  weekHistory,
}: {
  weekHistory: WeekTimeStudy[];
}) {
  const { t } = useTranslation(["statistics"]);
  const data = useMemo(() => {
    if (!weekHistory || weekHistory.length === 0) return [];

    // Ordenar por semana
    return [...weekHistory]
      .sort((a, b) => a.year * 100 + a.week - (b.year * 100 + b.week))
      .slice(-5) // Últimas 5 semanas
      .map((w) => ({
        name: t("statistics:week_number", { week: w.week }),
        foco: Math.round(w.total / 60), // Converter para horas
        meta: Math.round(w.target / 60),
      }));
  }, [weekHistory, t]);

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}><FaFire aria-hidden="true" /> {t("statistics:focus_history_hours")}</h3>
      <div style={{ width: "100%", height: 250, fontSize: "0.8rem" }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="foco"
              stroke="#3399FF"
              strokeWidth={3}
              activeDot={{ r: 6 }}
              name={t("statistics:realized")}
            />
            <Line
              type="monotone"
              dataKey="meta"
              stroke="#E0E0E0"
              strokeDasharray="5 5"
              name={t("statistics:target")}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
