import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import styles from "./statistics.module.css";
import { service, Event } from "~/service/service";
import { utils } from "~/utils";

const COLORS = {
  focusBar: "#ff7043",
  axis: "#5d4037",
  cardBg: "rgba(255, 255, 255, 0.5)",
  good: "#4CAF50",
  neutral: "#1565C0",
  text: "#444",
};

// --- FUNÇÃO PARA CALCULAR STREAK (CICLOS SEGUIDOS) ---
function calculateMaxStreak(events: Event[]) {
  if (events.length === 0) return 0;

  // Ordenar por data
  const sorted = [...events].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prevEnd = new Date(sorted[i - 1].endDate).getTime();
    const currStart = new Date(sorted[i].startDate).getTime();
    const gapMinutes = (currStart - prevEnd) / (1000 * 60);

    // Se a pausa entre sessões for menor que 5 min, conta como ciclo seguido
    if (gapMinutes > 0 && gapMinutes <= 5) {
      currentStreak++;
    } else {
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 1;
    }
  }
  return Math.max(maxStreak, currentStreak);
}

export function FocusStats() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    service
      .getAllUserEvents()
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro events focus:", err);
        setLoading(false);
      });
  }, []);

  // PROCESSAMENTO DE DADOS
  const stats = useMemo(() => {
    const today = new Date();
    const currentWeek = utils.getWeekNumber(today);
    const currentYear = today.getFullYear();

    // 1. Filtrar eventos ESTRITAMENTE desta semana e deste ano
    const weeklyEvents = events.filter((e) => {
      const d = new Date(e.startDate);
      return (
        utils.getWeekNumber(d) === currentWeek &&
        d.getFullYear() === currentYear
      );
    });

    // 2. Calcular durações em minutos
    const durations = weeklyEvents.map((e) => {
      const start = new Date(e.startDate).getTime();
      const end = new Date(e.endDate).getTime();
      return Math.round((end - start) / (1000 * 60));
    });

    if (durations.length === 0) {
      return {
        hasData: false,
        avg: 0,
        min: 0,
        max: 0,
        streak: 0,
        totalCount: 0,
        chartData: [],
      };
    }

    // 3. Métricas
    const totalTime = durations.reduce((a, b) => a + b, 0);

    // Média (Soma / Quantidade)
    const avg = Math.round(totalTime / durations.length);

    // Min e Max (Duração da sessão mais curta e mais longa)
    const min = Math.min(...durations);
    const max = Math.max(...durations);

    // Total de Sessões (Volume) - Placeholder até termos o "Interrompidos"
    const totalCount = durations.length;

    const streak = calculateMaxStreak(weeklyEvents);

    // 4. Preparar Gráfico Diário
    const daysMap = { Seg: 0, Ter: 0, Qua: 0, Qui: 0, Sex: 0, Sáb: 0, Dom: 0 };
    const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    weeklyEvents.forEach((e) => {
      const d = new Date(e.startDate);
      const duration = Math.round(
        (new Date(e.endDate).getTime() - d.getTime()) / (1000 * 60),
      );
      const dayName = weekDays[d.getDay()];
      if (daysMap[dayName as keyof typeof daysMap] !== undefined) {
        daysMap[dayName as keyof typeof daysMap] += duration;
      }
    });

    const chartData = [
      { day: "Seg", min: daysMap["Seg"] },
      { day: "Ter", min: daysMap["Ter"] },
      { day: "Qua", min: daysMap["Qua"] },
      { day: "Qui", min: daysMap["Qui"] },
      { day: "Sex", min: daysMap["Sex"] },
      { day: "Sáb", min: daysMap["Sáb"] },
      { day: "Dom", min: daysMap["Dom"] },
    ];

    return { hasData: true, avg, min, max, streak, totalCount, chartData };
  }, [events]);

  return (
    <div className={styles.statCardContainer}>
      <div className={styles.statTitle}>⏱️ Performance Pomodoro</div>

      <div className={styles.tasksGrid}>
        {/* COLUNA 1: Métricas de Comportamento */}
        <div className={styles.chartWrapper} style={{ alignItems: "stretch" }}>
          <div className={styles.chartTitleSmall}>Métricas da Semana</div>

          {stats.hasData ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                width: "100%",
              }}
            >
              {/* Card: Média */}
              <div
                className={styles.summaryCard}
                style={{ padding: "0.8rem", border: "1px solid #ddd" }}
              >
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: COLORS.neutral,
                  }}
                >
                  {stats.avg}m
                </div>
                <div className={styles.summaryLabel}>Média / Sessão</div>
              </div>

              {/* Card: Streak */}
              <div
                className={styles.summaryCard}
                style={{ padding: "0.8rem", border: "1px solid #ddd" }}
              >
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: COLORS.good,
                  }}
                >
                  {stats.streak}
                </div>
                <div className={styles.summaryLabel}>Ciclos Seguidos</div>
              </div>

              {/* Card: Min / Max */}
              <div
                className={styles.summaryCard}
                style={{ padding: "0.8rem", border: "1px solid #ddd" }}
              >
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: "bold",
                    color: COLORS.text,
                  }}
                >
                  {stats.min}m - {stats.max}m
                </div>
                <div className={styles.summaryLabel}>Min - Máx</div>
              </div>

              {/* Card: Total (Placeholder para Interrupções Futuras) */}
              <div
                className={styles.summaryCard}
                style={{ padding: "0.8rem", border: "1px solid #ddd" }}
              >
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: COLORS.text,
                  }}
                >
                  {stats.totalCount}
                </div>
                <div className={styles.summaryLabel}>Total Sessões</div>
              </div>
            </div>
          ) : (
            <div
              className={styles.noDataAvailableMessage}
              style={{ fontSize: "0.8rem", padding: "2rem" }}
            >
              Sem sessões de estudo esta semana.
            </div>
          )}
        </div>

        {/* COLUNA 2: Gráfico Diário */}
        <div className={styles.chartWrapper}>
          <div className={styles.chartTitleSmall}>Volume Diário</div>
          <div style={{ width: "100%", height: 180, fontSize: "0.65rem" }}>
            <ResponsiveContainer>
              <BarChart
                data={stats.chartData}
                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: COLORS.axis, fontWeight: "bold" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: COLORS.axis }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: `2px solid ${COLORS.axis}`,
                  }}
                  formatter={(value: number) => [`${value} min`, "Foco"]}
                />
                <Bar
                  dataKey="min"
                  radius={[4, 4, 0, 0]}
                  barSize={15}
                  fill={COLORS.focusBar}
                />
                <ReferenceLine y={120} stroke="#999" strokeDasharray="3 3" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
