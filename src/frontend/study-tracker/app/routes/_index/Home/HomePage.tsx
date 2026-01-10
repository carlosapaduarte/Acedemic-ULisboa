import React, { useEffect, useState, Suspense } from "react";
import styles from "./homePage.module.css";
import { useAppBar } from "~/components/AppBar/AppBarProvider";
import { MoodTrackerFlow } from "./MoodTracker/MoodTrackerFlow";
import { useNavigate } from "@remix-run/react";
import { service } from "~/service/service";
import { utils } from "~/utils";

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

  useEffect(() => {
    // 1. Verificar Mood
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
        const [events, tasks] = await Promise.all([
          service.getAllUserEvents().catch(() => []),
          service.getTasks(false).catch(() => []),
        ]);

        // Mock para a demo das notas
        setRecentNotes(DEMO_RECENT_NOTES);

        const today = new Date();
        const todayEvs = events
          .filter(
            (ev: any) =>
              utils.sameDay(new Date(ev.startDate), today) ||
              ev.everyDay ||
              (ev.everyWeek &&
                new Date(ev.startDate).getDay() === today.getDay())
          )
          .sort(
            (a: any, b: any) =>
              new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          );

        setTodayEvents(todayEvs.slice(0, 3));

        let completed = 0;
        let total = 0;
        if (Array.isArray(tasks)) {
          tasks.forEach((t: any) => {
            if (t.data?.status === "completed" || t.status === "completed")
              completed++;
            total++;
          });
        }
        setTaskStats({ total, completed });
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
  } = useHomePage();

  useAppBar("home");

  const progressPercent =
    taskStats.total > 0
      ? Math.round((taskStats.completed / taskStats.total) * 100)
      : 0;

  // --- LÓGICA POMODORO ---
  // Esta função constrói o URL com os valores que estão nos inputs
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
        <div className={styles.card} onClick={() => navigate("/tasks")}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <FaListCheck /> Tarefas
            </div>
          </div>
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
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 3. AGENDA */}
        <div className={styles.card} onClick={() => navigate("/calendar")}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <FaCalendar /> Agenda
            </div>
          </div>
          <div className={styles.agendaList}>
            {todayEvents.length > 0 ? (
              todayEvents.map((ev, i) => (
                <div key={i} className={styles.agendaItem}>
                  <div className={styles.timeBox}>
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
          onClick={
            handleGoToPomodoro
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
                e.stopPropagation(); // Garante que não dispara o evento do pai duas vezes
                handleGoToPomodoro();
              }}
            >
              Iniciar Ciclo
            </button>
          </div>
        </div>

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
                  <span
                    style={{
                      fontSize: "0.75rem",
                      opacity: 0.7,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {new Date(note.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
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
