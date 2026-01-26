import React, {
  useEffect,
  useState,
  Suspense,
  useRef,
  useLayoutEffect,
} from "react";
import styles from "./homePage.module.css";
import { useAppBar } from "~/components/AppBar/AppBarProvider";
import { MoodTrackerFlow } from "./MoodTracker/MoodTrackerFlow";
import { useNavigate } from "@remix-run/react";
import { service } from "~/service/service";
import { utils } from "~/utils";
import Confetti from "react-confetti";

import {
  FaCalendar,
  FaCircleCheck,
  FaPen,
  FaPlay,
  FaListCheck,
  FaBookOpen,
} from "react-icons/fa6";

const MOOD_STORAGE_KEY = "mood_tracker_log_v1";

const QUOTES = [
  {
    text: "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
    author: "Robert Collier",
  },
  {
    text: "Acredita que consegues e já percorreste metade do caminho.",
    author: "Theodore Roosevelt",
  },
  {
    text: "Não contes os dias, faz com que os dias contem.",
    author: "Muhammad Ali",
  },
  { text: "A persistência é o caminho do êxito.", author: "Charlie Chaplin" },
  { text: "A energia flui para onde vai a atenção.", author: "Tony Robbins" },
  { text: "Foca-te no progresso, não na perfeição.", author: "Bill Phillips" },
];

// --- DADOS FALSOS PARA A DEMO (MOCK DATA) ---
const DEMO_RECENT_NOTES = [
  {
    id: 101,
    uc: "Gestão de Projetos",
    date: new Date(),
    title: "Resumo Cap. 4 - Planeamento",
  },
  {
    id: 102,
    uc: "Sistemas Distribuídos",
    date: new Date(Date.now() - 86400000),
    title: "Apontamentos Aula Prática",
  },
  {
    id: 103,
    uc: "Programação Web",
    date: new Date(Date.now() - 172800000),
    title: "Estudo para o Exame",
  },
];

function useHomePage() {
  const [isMoodLogged, setIsMoodLogged] = useState<boolean>(false);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [currentQuote, setCurrentQuote] = useState({ text: "", author: "" });

  const [todayEvents, setTodayEvents] = useState<any[]>([]);
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0 });

  const [recentNotes, setRecentNotes] = useState<any[]>([]);
  const [pomoWork, setPomoWork] = useState(25);
  const [pomoBreak, setPomoBreak] = useState(5);
  const [showConfetti, setShowConfetti] = useState(false);

  // --- FUNÇÃO PARA CALCULAR CONTRASTE (PRETO vs BRANCO) ---
  const getContrastColor = (hexColor: string) => {
    if (!hexColor || !hexColor.startsWith("#")) {
      const match = hexColor.match(/#[a-fA-F0-9]{6}/);
      if (match) hexColor = match[0];
      else return "#ffffff";
    }

    const hex = hexColor.replace("#", "");
    // Converter para RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Fórmula de brilho YIQ
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;

    // Se for escuro (< 128), retorna branco. Se for claro, retorna preto/cinza escuro
    return yiq >= 128 ? "#000000" : "#ffffff";
  };

  const resolveEventStyle = (event: any, allTags: any[]) => {
    const FALLBACK_COLOR = "#3399FF";

    const eventColorUpper = event.color ? event.color.toUpperCase() : null;
    const fallbackUpper = FALLBACK_COLOR.toUpperCase();

    // 1. Cor Direta
    if (eventColorUpper && eventColorUpper !== fallbackUpper) {
      return { background: event.color };
    }

    // 2. Cor das Tags
    if (event.tags && event.tags.length > 0 && allTags.length > 0) {
      const tagColors = event.tags
        .map((tagRef: any) => {
          const found = allTags.find((t) => {
            if (typeof tagRef === "object") return t.id === tagRef.id;
            const refStr = String(tagRef).toLowerCase().trim();
            const tId = String(t.id).toLowerCase();
            const tNamePt = (t.name_pt || "").toLowerCase();
            const tNameEn = (t.name_en || "").toLowerCase();
            const tName = (t.name || "").toLowerCase();

            return (
              tId === refStr ||
              tNamePt === refStr ||
              tNameEn === refStr ||
              tName === refStr
            );
          });
          return found ? found.color : null;
        })
        .filter((c: string | null) => c);

      if (tagColors.length > 0) {
        if (tagColors.length === 1) {
          return { background: tagColors[0] };
        }
        return {
          background: `linear-gradient(135deg, ${tagColors.join(", ")})`,
        };
      }
    }

    return { background: FALLBACK_COLOR };
  };

  useEffect(() => {
    const promptedState = localStorage.getItem(MOOD_STORAGE_KEY);
    if (promptedState) {
      const prompted = new Date(promptedState);
      const today = new Date();
      const hasAnsweredToday =
        today.getFullYear() === prompted.getFullYear() &&
        today.getMonth() === prompted.getMonth() &&
        today.getDate() === prompted.getDate();
      setIsMoodLogged(hasAnsweredToday);
    }

    setCurrentQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    async function fetchData() {
      try {
        const [events, tasks, tags] = await Promise.all([
          service.getAllUserEvents().catch(() => []),
          service.getTasks(false).catch(() => []),
          service.fetchUserTags().catch(() => []),
        ]);

        setRecentNotes(DEMO_RECENT_NOTES);

        const now = new Date();

        const todayEvs = events
          .filter((ev: any) => {
            const evStartDate = new Date(ev.startDate);
            const isForToday =
              utils.sameDay(evStartDate, now) ||
              ev.everyDay ||
              (ev.everyWeek && evStartDate.getDay() === now.getDay());

            if (!isForToday) return false;

            const eventInstanceTime = new Date(now);
            eventInstanceTime.setHours(
              evStartDate.getHours(),
              evStartDate.getMinutes(),
              0,
              0,
            );
            return eventInstanceTime > now;
          })
          .sort((a: any, b: any) => {
            const dateA = new Date(a.startDate);
            const dateB = new Date(b.startDate);
            const minutesA = dateA.getHours() * 60 + dateA.getMinutes();
            const minutesB = dateB.getHours() * 60 + dateB.getMinutes();
            return minutesA - minutesB;
          })
          .map((ev: any) => {
            const style = resolveEventStyle(ev, tags);
            const textColor = getContrastColor(style.background);

            return {
              ...ev,
              eventStyle: style,
              textColor: textColor,
            };
          });

        setTodayEvents(todayEvs);

        // --- TAREFAS ---
        let completedCount = 0;
        let totalCount = 0;

        if (Array.isArray(tasks)) {
          tasks.forEach((t: any) => {
            const taskDateStr =
              t.dueDate ||
              t.date ||
              t.deadline ||
              t.data?.deadline ||
              t.data?.date;
            if (!taskDateStr) return;

            const taskDate = new Date(taskDateStr);
            const isCompleted =
              t.status === "completed" ||
              t.data?.status === "completed" ||
              t.completed === true;

            const isToday = utils.sameDay(taskDate, now);
            const taskZero = new Date(taskDate);
            taskZero.setHours(0, 0, 0, 0);
            const todayZero = new Date(now);
            todayZero.setHours(0, 0, 0, 0);
            const isOverdue =
              taskZero.getTime() < todayZero.getTime() && !isCompleted;

            if (isToday || isOverdue) {
              totalCount++;
              if (isCompleted) completedCount++;
            }
          });
        }

        setTaskStats({ total: totalCount, completed: completedCount });

        if (totalCount > 0 && completedCount === totalCount) {
          setShowConfetti(true);
        } else {
          setShowConfetti(false);
        }
      } catch (error) {
        console.error("Erro dashboard:", error);
      }
    }
    fetchData();
  }, []);

  const completeTracker = () => {
    const today = new Date();
    localStorage.setItem(MOOD_STORAGE_KEY, today.toISOString());
    setIsMoodLogged(true);
    setIsSheetOpen(false);
    setCurrentQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  };

  return {
    isMoodLogged,
    isSheetOpen,
    setIsSheetOpen,
    completeTracker,
    todayEvents,
    taskStats,
    recentNotes,
    currentQuote,
    pomoWork,
    setPomoWork,
    pomoBreak,
    setPomoBreak,
    showConfetti,
  };
}

export default function HomePage() {
  const navigate = useNavigate();
  const {
    isMoodLogged,
    isSheetOpen,
    setIsSheetOpen,
    completeTracker,
    todayEvents,
    taskStats,
    recentNotes,
    currentQuote,
    pomoWork,
    setPomoWork,
    pomoBreak,
    setPomoBreak,
    showConfetti,
  } = useHomePage();

  useAppBar("home");

  const tasksCardRef = useRef<HTMLDivElement>(null);
  const [cardSize, setCardSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (tasksCardRef.current) {
      setCardSize({
        width: tasksCardRef.current.offsetWidth,
        height: tasksCardRef.current.offsetHeight,
      });
    }
  }, [tasksCardRef.current, taskStats]);

  const progressPercent =
    taskStats.total > 0
      ? Math.round((taskStats.completed / taskStats.total) * 100)
      : 0;

  const handleGoToPomodoro = () => {
    navigate(`/pomodoro?work=${pomoWork}&break=${pomoBreak}`);
  };

  const handleOpenMoodTracker = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSheetOpen(true);
  };

  return (
    <div className={styles.homePage}>
      <div className={styles.headerSection}>
        <div className={styles.dateBadge}>
          {new Date().toLocaleDateString("pt-PT", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </div>
      </div>

      <div className={styles.bentoGrid}>
        {/* 1. MOOD TRACKER */}
        <div
          className={`${styles.card} ${styles.moodSection}`}
          onClick={(e) => !isMoodLogged && handleOpenMoodTracker(e)}
          style={{ cursor: isMoodLogged ? "default" : "pointer" }}
        >
          {!isMoodLogged ? (
            <div className={styles.moodInitial}>
              <div>
                <h3 className={styles.cardTitle}>Mood Tracker</h3>
                <p style={{ marginTop: "8px", marginBottom: "1rem" }}>
                  Como te sentes hoje? Regista o teu progresso.
                </p>
                <button
                  className={styles.moodBtn}
                  onClick={handleOpenMoodTracker}
                >
                  Registar Agora
                </button>
              </div>
              <div style={{ fontSize: "3rem", opacity: 0.8 }}>✨</div>
            </div>
          ) : (
            <div className={styles.moodSuccessContainer}>
              <div className={styles.successHeader}>
                <FaCircleCheck /> Mood Registado!
              </div>
              <div className={styles.moodQuote}>"{currentQuote.text}"</div>
              <div className={styles.quoteAuthor}>— {currentQuote.author}</div>
              <button
                className={styles.editMoodBtn}
                onClick={handleOpenMoodTracker}
              >
                <FaPen size={10} /> Editar
              </button>
            </div>
          )}
        </div>

        {/* 2. TAREFAS */}
        <div
          className={styles.card}
          onClick={() => navigate("/tasks")}
          ref={tasksCardRef}
          style={{
            position: "relative",
            overflow: "hidden",
          }}
        >
          {showConfetti && cardSize.width > 0 && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 0,
                pointerEvents: "none",
              }}
            >
              <Confetti
                width={cardSize.width}
                height={cardSize.height}
                recycle={false}
                numberOfPieces={200}
                gravity={0.15}
              />
            </div>
          )}

          <div
            className={styles.cardHeader}
            style={{ position: "relative", zIndex: 1 }}
          >
            <div className={styles.cardTitle}>
              <FaListCheck /> Tarefas com prazo para Hoje
            </div>
          </div>

          {taskStats.total === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "1.5rem 0",
                color: "var(--color-3)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>🔍</span>
              <span style={{ fontSize: "0.9rem", fontStyle: "italic" }}>
                Sem tarefas para hoje!
              </span>
            </div>
          ) : (
            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                }}
              >
                <span className={styles.statNumber}>{taskStats.completed}</span>
                <span style={{ fontSize: "0.9rem", color: "var(--color-3)" }}>
                  de {taskStats.total}
                </span>
              </div>
              <div className={styles.progressBarBg}>
                <div
                  className={styles.progressBarFill}
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor:
                      progressPercent === 100 ? "#4CAF50" : undefined,
                  }}
                />
              </div>
              {progressPercent === 100 && (
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#4CAF50",
                    marginTop: "5px",
                    fontWeight: "bold",
                  }}
                >
                  Bom trabalho! 💪
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. AGENDA */}
        <div
          className={styles.card}
          onClick={() => navigate("/calendar")}
          style={{
            display: "flex",
            flexDirection: "column",
            cursor: "pointer",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <FaCalendar /> Agenda
            </div>
          </div>

          <div
            className={styles.agendaList}
            style={{
              overflowY: "auto",
              flex: 1,
              height: "100%",
              minHeight: 0,
              paddingRight: "4px",
            }}
          >
            {todayEvents.length > 0 ? (
              todayEvents.map((ev, i) => (
                <div
                  key={i}
                  className={styles.agendaItem}
                  style={{
                    ...ev.eventStyle,

                    // Cor do Texto Geral (Titulo)
                    color: ev.textColor,

                    borderLeft: "none",
                    marginBottom: "8px",
                    flexShrink: 0,
                  }}
                >
                  <div
                    className={styles.timeBox}
                    style={{
                      fontWeight: "bold",
                      opacity: 0.9,
                      color: ev.textColor,
                    }}
                  >
                    {new Date(ev.startDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontWeight: 600,
                    }}
                  >
                    {ev.title}
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  color: "var(--color-3)",
                  fontSize: "0.9rem",
                  fontStyle: "italic",
                  textAlign: "center",
                  padding: "10px",
                }}
              >
                Agenda livre hoje.
              </div>
            )}
          </div>
        </div>

        {/* 4. POMODORO */}
        <div
          className={styles.card}
          onClick={handleGoToPomodoro}
          style={{ cursor: "pointer" }}
        >
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <FaPlay size={12} /> Foco
            </div>
          </div>
          <div className={styles.pomodoroContainer}>
            <div className={styles.pomodoroInputs}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Foco (m)</label>
                <input
                  type="number"
                  className={styles.timeInput}
                  value={pomoWork}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setPomoWork(Number(e.target.value))}
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Pausa (m)</label>
                <input
                  type="number"
                  className={styles.timeInput}
                  value={pomoBreak}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setPomoBreak(Number(e.target.value))}
                />
              </div>
            </div>
            <button
              className={styles.startPomoBtn}
              onClick={(e) => {
                e.stopPropagation();
                handleGoToPomodoro();
              }}
            >
              Iniciar
            </button>
          </div>
        </div>

        {/* 5. APONTAMENTOS */}
        <div
          className={styles.card}
          onClick={() => navigate("/notes")}
          style={{ cursor: "pointer" }}
        >
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <FaBookOpen /> Apontamentos Recentes
            </div>
          </div>

          <div className={styles.agendaList}>
            {recentNotes.length > 0 ? (
              recentNotes.map((note, i) => (
                <div
                  key={i}
                  className={styles.agendaItem}
                  style={{ justifyContent: "space-between", cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/notes");
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                      }}
                    >
                      {note.uc}
                    </span>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--color-3)",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                      }}
                    >
                      {note.title}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "1rem",
                  fontStyle: "italic",
                  fontSize: "0.9rem",
                  color: "#888",
                }}
              >
                Sem apontamentos recentes.
              </div>
            )}
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        {isSheetOpen && (
          <MoodTrackerFlow
            onComplete={completeTracker}
            onClose={() => setIsSheetOpen(false)}
          />
        )}
      </Suspense>
    </div>
  );
}
