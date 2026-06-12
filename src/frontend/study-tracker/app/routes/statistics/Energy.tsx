import styles from "./statistics.module.css";
import { useEffect, useRef, useState } from "react";
import { DailyEnergyStatus, service } from "~/service/service";
import { useTranslation } from "react-i18next";

const MOOD_CONFIG: Record<
  number,
  { emoji: string; color: string; labelDefault: string }
> = {
  5: { emoji: "🤩", color: "#2E7D32", labelDefault: "Muito Bem" },
  4: { emoji: "😄", color: "#4CAF50", labelDefault: "Bem" },
  3: { emoji: "😐", color: "#FFC107", labelDefault: "Neutro" },
  2: { emoji: "🙁", color: "#FF9800", labelDefault: "Não muito bem" },
  1: { emoji: "😞", color: "#F44336", labelDefault: "Muito Mal" },
};

function getMoodConfig(level: number | null) {
  if (level === null) return null;
  return (
    MOOD_CONFIG[level] || { emoji: "❓", color: "#9E9E9E", labelDefault: "?" }
  );
}

// --- 2. SUGESTÕES PEDAGÓGICAS (ZIMMERMAN - FASE DE PLANEAMENTO) ---
// Mapeia cada Impacto a uma sugestão de ação futura
const IMPACT_SUGGESTIONS: Record<string, string> = {
  Estudo:
    "Experimenta partir a matéria em blocos mais pequenos e define objetivos curtos.",
  Trabalho:
    "Tenta renegociar prazos ou priorizar apenas as 3 tarefas críticas do dia.",
  Família:
    "Reserva um momento de qualidade esta semana para resolver pendentes emocionais.",
  Amigos:
    "O apoio social é crucial. Agenda uma saída ou conversa para recarregar baterias.",
  Saúde:
    "Não ignores o corpo. Considera uma pausa ativa ou marcar aquela consulta pendente.",
  Sono: "A higiene do sono é a base de tudo. Tenta definir uma hora fixa para desconectar hoje.",
  Dinheiro:
    "A incerteza gera ansiedade. Faz um plano de gastos simples para a próxima semana.",
  Tempo:
    "Sentes falta de tempo? Tenta usar a técnica Pomodoro para focar no que importa.",
  "Auto-estima":
    "Sê gentil contigo. Regista 3 pequenas vitórias que tiveste hoje, por menores que sejam.",
  "Acontecimentos Atuais":
    "Limita o consumo de notícias se te está a afetar. Foca no que podes controlar.",
};

// Fallback caso apareça um impacto novo que não esteja na lista
const DEFAULT_SUGGESTION =
  "Tenta identificar uma pequena ação que possas fazer amanhã para melhorar isto.";

// --- 3. LÓGICA DE ANÁLISE ---
function calculateZimmermanInsights(history: DailyEnergyStatus[]) {
  const validLogs = history.filter((h) => h.level !== null);

  if (validLogs.length === 0) return null;

  // Contar impactos
  const getFrequency = (logs: DailyEnergyStatus[]) => {
    const counts: Record<string, number> = {};
    logs.forEach((log) => {
      if (log.impacts) {
        log.impacts.forEach((imp) => (counts[imp] = (counts[imp] || 0) + 1));
      }
    });
    return counts;
  };

  const happyLogs = validLogs.filter((h) => h.level! >= 4); // Níveis 4 e 5
  const sadLogs = validLogs.filter((h) => h.level! <= 2); // Níveis 1 e 2

  const happyCounts = getFrequency(happyLogs);
  const sadCounts = getFrequency(sadLogs);

  // Obter o topo
  const getTop = (counts: Record<string, number>) =>
    Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  const facilitator = getTop(happyCounts);
  const barrier = getTop(sadCounts);

  // DETETOR DE RESILIÊNCIA (BANDURA)
  let resilienceEvent: { date: Date; impact: string } | null = null;
  if (barrier) {
    // Procura dia com a barreira MAS mood >= 3
    const resilienceLog = validLogs.find(
      (log) => log.level! >= 3 && log.impacts?.includes(barrier),
    );
    if (resilienceLog) {
      resilienceEvent = { date: resilienceLog.date, impact: barrier };
    }
  }

  return {
    facilitator,
    barrier,
    resilienceEvent,
    hasData: validLogs.length > 0,
  };
}

// --- 4. PREENCHER LINHA DO TEMPO ---
function fillMissingDays(history: DailyEnergyStatus[]): DailyEnergyStatus[] {
  if (history.length === 0) return [];

  // 1. Normalizar tudo para meia-noite (00:00:00) para evitar bugs de horas
  const normalize = (d: Date) => {
    const newD = new Date(d);
    newD.setHours(0, 0, 0, 0);
    return newD;
  };

  const sorted = [...history].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  // Datas de referência normalizadas
  const firstDate = normalize(sorted[0].date);
  const today = normalize(new Date());
  const lastDateLog = normalize(sorted[sorted.length - 1].date);

  // Garante que a linha vai até Hoje, mesmo que o último log seja antigo
  // OU vai até ao futuro se tiveres logs de 2026
  const effectiveLastDate = lastDateLog > today ? lastDateLog : today;

  // Limite visual de 30 dias
  const MAX_DAYS = 30;
  const minDate = new Date(effectiveLastDate);
  minDate.setDate(minDate.getDate() - MAX_DAYS);

  // Data de início (não anterior a 30 dias atrás)
  const startDate = firstDate < minDate ? minDate : firstDate;

  const timeline: DailyEnergyStatus[] = [];
  const current = new Date(startDate); // Começa à meia-noite

  // Mapa usando a string da data (YYYY-MM-DD) para encontrar logs
  const logMap = new Map(
    sorted.map((i) => [i.date.toISOString().split("T")[0], i]),
  );

  // Loop dia a dia
  while (current <= effectiveLastDate) {
    // Formatar data atual do loop para chave
    // Nota: Ajuste para fuso horário local se necessário, mas split('T') em Date UTC costuma funcionar bem se consistente
    const dateKey = current.toISOString().split("T")[0];

    if (logMap.has(dateKey)) {
      timeline.push(logMap.get(dateKey)!);
    } else {
      timeline.push({
        date: new Date(current),
        level: null as any,
        label: "Sem registo",
        emotions: [],
        impacts: [],
      });
    }
    // Avançar 1 dia
    current.setDate(current.getDate() + 1);
  }
  return timeline;
}

// --- COMPONENTE PRINCIPAL ---
export function EnergyStats() {
  const { t } = useTranslation(["statistics"]);
  const [timeline, setTimeline] = useState<DailyEnergyStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    service
      .fetchEnergyHistory()
      .then((data) => {
        const fullHistory = fillMissingDays(data);
        setTimeline(fullHistory);
        setLoading(false);
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
          }
        }, 100);
      })
      .catch(() => {
        setTimeline([]);
        setLoading(false);
      });
  }, []);

  const insights = calculateZimmermanInsights(timeline);

  return (
    <div className={styles.statsContainer}>
      <div className={styles.statsContainerTitleAndDateDiv}>
        <div className={styles.statsContainerTitle}>
          ⚡ Monitorização de Energia
        </div>
      </div>

      {/* --- SCROLL HORIZONTAL --- */}
      {!loading && timeline.length > 0 ? (
        <div className={styles.energyScrollContainer} ref={scrollRef}>
          {timeline.map((status, index) => {
            const hasLog = status.level !== null;
            const config = getMoodConfig(hasLog ? status.level : null);
            const isLastItem = index === timeline.length - 1;

            return (
              <div
                key={index}
                className={`${styles.energyItem} ${
                  isLastItem ? styles.todayItem : ""
                }`}
                title={status.label || (config ? config.labelDefault : "")}
              >
                {hasLog && config ? (
                  <div
                    style={{
                      fontSize: isLastItem ? "3.5rem" : "2.2rem",
                      filter: isLastItem
                        ? "drop-shadow(0 4px 6px rgba(0,0,0,0.2))"
                        : "grayscale(40%) opacity(0.8)",
                      cursor: "default",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {config.emoji}
                  </div>
                ) : (
                  <div className={styles.emptyDayDash}>—</div>
                )}

                <div
                  style={{
                    fontSize: isLastItem ? "0.8rem" : "0.65rem",
                    fontWeight: "bold",
                    color: isLastItem ? "var(--color-2)" : "#888",
                    whiteSpace: "nowrap",
                    textTransform: "uppercase",
                  }}
                >
                  {status.date.getDate()}{" "}
                  {status.date
                    .toLocaleString("pt-PT", { month: "short" })
                    .replace(".", "")}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.noDataAvailableMessage}>
          {loading ? "A carregar..." : "Sem dados disponíveis."}
        </div>
      )}

      <div
        style={{
          width: "100%",
          height: "1px",
          background: "#eee",
          margin: "1.5rem 0",
        }}
      />

      {/* --- PADRÕES DE AUTORREGULAÇÃO --- */}
      <div>
        <div className={styles.historyTitle}>🧠 Padrões de Desempenho</div>

        {insights && insights.hasData ? (
          <div className={styles.insightsContainer}>
            {/* 1. Facilitadores */}
            <div
              className={styles.insightCard}
              style={{ borderLeftColor: "#4CAF50" }}
            >
              <div className={styles.insightTitle} style={{ color: "#2E7D32" }}>
                🔥 Fonte de Eficácia
              </div>
              <div className={styles.insightContent}>
                {insights.facilitator ? (
                  <>
                    Sentes-te mais capaz e energizado quando o contexto envolve:{" "}
                    <br />
                    <span
                      style={{
                        color: "#4CAF50",
                        background: "#e8f5e9",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        display: "inline-block",
                        marginTop: "4px",
                      }}
                    >
                      ✨ {insights.facilitator}
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: "0.8rem", color: "#888" }}>
                    A aguardar mais dados positivos...
                  </span>
                )}
              </div>
            </div>

            {/* 2. Barreiras (COM SUGESTÃO DINÂMICA) */}
            <div
              className={styles.insightCard}
              style={{ borderLeftColor: "#F44336" }}
            >
              <div className={styles.insightTitle} style={{ color: "#C62828" }}>
                🚧 Desafio Recorrente
              </div>
              <div className={styles.insightContent}>
                {insights.barrier ? (
                  <>
                    O fator <b>{insights.barrier}</b> surge frequentemente nos
                    dias difíceis.
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "0.8rem",
                        color: "#444",
                        fontStyle: "italic",
                        background: "rgba(255,255,255,0.8)",
                        padding: "8px",
                        borderRadius: "6px",
                      }}
                    >
                      💡 <b>Estratégia sugerida:</b>
                      <br />
                      {IMPACT_SUGGESTIONS[insights.barrier] ||
                        DEFAULT_SUGGESTION}
                    </div>
                  </>
                ) : (
                  <span style={{ fontSize: "0.8rem", color: "#888" }}>
                    A aguardar dados sobre dificuldades...
                  </span>
                )}
              </div>
            </div>

            {/* 3. Resiliência (Bandura) */}
            {insights.resilienceEvent && (
              <div
                className={styles.insightCard}
                style={{ borderLeftColor: "#2196F3", gridColumn: "1 / -1" }}
              >
                <div
                  className={styles.insightTitle}
                  style={{ color: "#1565C0" }}
                >
                  🏆 Momento de Domínio (Resiliência)
                </div>
                <div className={styles.insightContent}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>💪</span>
                    <div>
                      No dia{" "}
                      <b>
                        {insights.resilienceEvent.date.toLocaleDateString(
                          "pt-PT",
                          { day: "numeric", month: "long" },
                        )}
                      </b>
                      , lidaste com <b>"{insights.resilienceEvent.impact}"</b>{" "}
                      mas mantiveste um bom nível de energia!
                      <br />
                      <span style={{ fontSize: "0.8rem", color: "#666" }}>
                        Isto prova a tua capacidade de adaptação. O que fizeste
                        de diferente nesse dia?
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              marginTop: "15px",
              fontSize: "0.9rem",
              color: "#666",
              fontStyle: "italic",
              textAlign: "center",
              background: "#f9f9f9",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            Continua a registar o teu dia. O sistema irá identificar
            automaticamente estratégias para a tua motivação.
          </div>
        )}
      </div>
    </div>
  );
}