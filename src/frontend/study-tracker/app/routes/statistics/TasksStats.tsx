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
  if (totalCompleted === 0) {
    return {
      type: "neutral",
      title: "💤 Sem dados recentes",
      text: "Ainda não concluíste tarefas nos últimos 7 dias. Começa com algo pequeno!",
    };
  }

  // 1. ANÁLISE DE CONSISTÊNCIA (Zimmerman - Gestão de Tempo)
  // Se trabalhou em poucos dias mas fez muito = "Cramming" (Surtos)
  if (activeDaysCount <= 2 && totalCompleted > 3) {
    return {
      type: "warning",
      title: "⚡ Surtos de Produtividade",
      text: `Concluíste ${totalCompleted} tarefas, mas concentradas em apenas ${activeDaysCount} dia(s). Tenta distribuir a carga ao longo da semana para evitar cansaço.`,
    };
  }

  // Se trabalhou em 4 ou mais dias = Consistência Real
  if (activeDaysCount >= 4) {
    return {
      type: "success",
      title: "📈 Ritmo Consistente",
      text: "Ótimo trabalho! Estás a manter uma rotina diária estável, o que ajuda a criar hábitos duradouros.",
    };
  }

  // 2. ANÁLISE DE PRIORIDADE (Bandura - Autoeficácia)
  // Se fez muitas tarefas de prioridade ALTA
  if (priorityBreakdown.high > priorityBreakdown.low + priorityBreakdown.med) {
    return {
      type: "success",
      title: "🦁 Foco no Essencial",
      text: "Estás a atacar as tarefas de Prioridade Alta! Resolver o mais difícil primeiro aumenta muito a tua autoeficácia.",
    };
  }

  // Default
  return {
    type: "neutral",
    title: "✅ Tarefas em Dia",
    text: `Completaste ${totalCompleted} tarefas recentemente. Continua a registar o teu progresso.`,
  };
}

// --- COMPONENTE PRINCIPAL ---
export function TasksStats({ tasks }: { tasks: Task[] }) {
  const { t } = useTranslation(["statistics"]);

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
          .toLocaleString("pt-PT", { month: "short" })
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
              .toLocaleString("pt-PT", { month: "short" })
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
        { name: "Alta", value: prioCount.high, color: COLORS.prioHigh },
        { name: "Média", value: prioCount.med, color: COLORS.prioMedium },
        { name: "Baixa", value: prioCount.low, color: COLORS.prioLow },
      ].filter((d) => d.value > 0); // Só mostra o que tem dados

      return {
        barData: barChartData,
        pieData: pieChartData,
        totalCompleted: completedCount,
        activeDays: activeDaysCount,
        priorities: prioCount,
      };
    }, [tasks]);

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
          alt="Tasks"
          style={{ height: "1.2em" }}
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
        ✅ Performance de Tarefas
      </div>

      <div className={styles.tasksGrid}>
        {/* GRÁFICO 1: BARRAS (VOLUME) */}
        <div className={styles.chartWrapper}>
          <div className={styles.chartTitleSmall}>Tarefas / Dia</div>
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
              Sem tarefas concluídas.
            </div>
          )}
        </div>

        {/* GRÁFICO 2: DONUT (PRIORIDADE) */}
        <div className={styles.chartWrapper}>
          <div className={styles.chartTitleSmall}>Por Prioridade</div>
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
            <div style={{ color: "#999", fontSize: "0.8rem" }}>Sem dados.</div>
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
            {insight.title}
          </div>
          <div
            className={styles.insightContent}
            style={{ fontSize: "0.9rem", fontWeight: "normal" }}
          >
            {insight.text}
          </div>
        </div>
      )}
    </div>
  );
}
