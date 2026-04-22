import { LanguageButton } from "~/components/LanguageButton/LanguageButton";
import homeAppBarStyles from "./HomeAppBar/homeAppBar.module.css";
import styles from "./appBar.module.css";
import cleanAppBarStyles from "./cleanAppBar.module.css";
import { useNavigate, useLocation } from "@remix-run/react";
import { SettingsButton } from "~/components/LanguageButton/SettingsButton";
import { GreetingsContainer } from "./HomeAppBar/HomeAppBar";
import classNames from "classnames";
import React, { useContext, useState, useEffect, useRef } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { IconContext } from "react-icons";
import { AppBarContext } from "./AppBarProvider";
import { useTranslation } from "react-i18next";

function GlobalStatusWidgets() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState<string | null>(null);
  const [streakWarning, setStreakWarning] = useState<string | null>(null);
  const [currentState, setCurrentState] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // 💡 INJETAR O SOM DIRETAMENTE NA APPBAR
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    audioRef.current = new Audio('/tracker/sounds/bell.mp3');
    audioRef.current.load();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => setTick(t => t + 1);
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const state = localStorage.getItem("pomodoro_state");
      const endStr = localStorage.getItem("active_pomodoro_end");
      
      setCurrentState(state);

      // 1. MÁQUINA DE ESTADOS DO POMODORO
      if (state && endStr) {
        const end = parseInt(endStr, 10);
        
        if (now < end) {
          // AINDA A CONTAR
          const diff = Math.floor((end - now) / 1000);
          const m = Math.floor(diff / 60).toString().padStart(2, "0");
          const s = (diff % 60).toString().padStart(2, "0");
          setPomodoroTimeLeft(`${m}:${s}`);
        } else {
          // 🚨 O TEMPO ACABOU! Tocar som e fazer transição
          if (audioRef.current) {
            audioRef.current.currentTime = 1.0;
            audioRef.current.play().catch(e => console.log("Erro som AppBar:", e));
          }

          if (state === "study") {
            // Passar para Pausa
            const pauseEndStr = localStorage.getItem("active_pause_end");
            if (pauseEndStr) {
              localStorage.setItem("active_pomodoro_end", pauseEndStr);
              localStorage.setItem("pomodoro_state", "pause");
              setPomodoroTimeLeft("00:00");
            }
          } else if (state === "pause") {
            // Acabou tudo, iniciar a Streak!
            localStorage.removeItem("active_pomodoro_end");
            localStorage.removeItem("active_pause_end");
            localStorage.removeItem("pomodoro_state");
            localStorage.setItem("streak_deadline", (now + 5 * 60000).toString());
            setPomodoroTimeLeft(null);
          }
        }
      } else {
        setPomodoroTimeLeft(null);
      }

      // 2. ALERTA DE STREAK
      const streakEndStr = localStorage.getItem("streak_deadline");
      if (streakEndStr) {
        const end = parseInt(streakEndStr, 10);
        const diff = Math.floor((end - now) / 1000);
        
        if (diff > 0) {
          const m = Math.floor(diff / 60).toString().padStart(2, "0");
          const s = (diff % 60).toString().padStart(2, "0");
          setStreakWarning(`${m}:${s}`);
        } else {
          setStreakWarning(null);
          localStorage.removeItem("streak_deadline");
        }
      } else {
        setStreakWarning(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tick]);

  const isPomodoroRoute = location.pathname.includes('/pomodoro');
  const showPomodoroWidget = pomodoroTimeLeft !== null && !isPomodoroRoute;

  // Textos e cores dinâmicas
  const widgetColor = currentState === "pause" ? "#66BB6A" : "var(--color-2, #3498db)";
  const widgetText = currentState === "pause" ? "☕ Em Pausa:" : "⏱️ A Estudar:";

  return (
    <>
      {streakWarning && (
        <div style={{ position: "fixed", top: "70px", left: "50%", transform: "translateX(-50%)", zIndex: 9999, backgroundColor: "#FFCA28", color: "#5D4037", padding: "8px 16px", borderRadius: "50px", fontWeight: "bold", boxShadow: "0 4px 10px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: "8px", animation: "pulse 2s infinite", whiteSpace: "nowrap" }}>
          🔥 Começa em {streakWarning} para manter a Streak!
        </div>
      )}

      {showPomodoroWidget && (
        <div 
          onClick={() => navigate('/pomodoro')}
          style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 9999, backgroundColor: widgetColor, color: "white", padding: "10px 20px", borderRadius: "50px", fontWeight: "bold", boxShadow: "0 4px 10px rgba(0,0,0,0.3)", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "background-color 0.5s" }}
        >
          {widgetText} {pomodoroTimeLeft}
        </div>
      )}
      
      <style>{`
        @keyframes pulse {
          0% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.05); }
          100% { transform: translateX(-50%) scale(1); }
        }
      `}</style>
    </>
  );
}

function SideBarNavButton({
  text,
  url,
  iconUrl,
  setIsSideBarOpen,
}: {
  text: string;
  url: string;
  iconUrl?: string;
  setIsSideBarOpen: (isOpen: boolean) => void;
}) {
  const navigate = useNavigate();

  const tutorialClass = `tutorial-target-nav-${url.replace("/", "")}`;

  return (
    <div className={`${styles.sideBarNavButtonContainer}`}>
      <a
        href={url}
        onClick={(e) => {
          e.preventDefault();
          setIsSideBarOpen(false);
          navigate(url);
        }}
        className={`${styles.roundButton} ${styles.sideBarNavButton} ${tutorialClass}`}
      >
        <div className={styles.sideBarButtonIconContainer} aria-hidden={true}>
          {iconUrl ? (
            <img
              src={iconUrl}
              alt=""
              className={`${styles.sideBarNavButtonIcon}`}
            />
          ) : (
            <></>
          )}
        </div>
        <div className={`${styles.sideBarNavButtonText}`}>{text}</div>
      </a>
    </div>
  );
}

function SideBarNavigationMenu({
  setIsSideBarOpen,
}: {
  setIsSideBarOpen: (isOpen: boolean) => void;
}) {
  const { t } = useTranslation("navigation");

  return (
    <>
      <SideBarNavButton
        text={t("navigation:calendar")}
        url={"/calendar"}
        iconUrl={"icons/calendar_icon.png"}
        setIsSideBarOpen={setIsSideBarOpen}
      />
      {/*<SideBarNavButton text={t("navigation:schedule")} url={"/calendar"} iconUrl={"icons/schedule_icon.png"}
                              setIsSideBarOpen={setIsSideBarOpen} />*/}
      <SideBarNavButton
        text={t("navigation:tasks")}
        url={"/tasks"}
        iconUrl={"icons/tasks_icon.png"}
        setIsSideBarOpen={setIsSideBarOpen}
      />
      {/*<SideBarNavButton text={t("navigation:notes")} url={"/archives"} iconUrl={"icons/notes_icon.png"}
                              setIsSideBarOpen={setIsSideBarOpen} />*/}
      <SideBarNavButton
        text={t("navigation:study")}
        url={"/study"}
        iconUrl={"icons/study_icon.png"}
        setIsSideBarOpen={setIsSideBarOpen}
      />
      <SideBarNavButton
        text={t("navigation:statistics")}
        url={"/statistics"}
        iconUrl={"icons/statistics_icon.png"}
        setIsSideBarOpen={setIsSideBarOpen}
      />
      {/*<SideBarNavButton text={t("navigation:badges")} url={"/badges"} iconUrl={"icons/badges_icon.png"}
                              setIsSideBarOpen={setIsSideBarOpen} />*/}
    </>
  );
}

function SideBar() {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const { appBarVariant } = useContext(AppBarContext);
  const menuRef = useRef<HTMLDivElement>(null);

  // detetor de cliques fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsSideBarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={menuRef}
      data-expanded={isSideBarOpen}
      className={classNames(
        appBarVariant === "default" && styles.sideBar,
        appBarVariant === "home" && homeAppBarStyles.sideBar,
      )}
    >
      <div className={styles.sideBarIconContainer}>
        <button
          className={`${styles.sideBarIconButton} tutorial-target-hamburger`}
          onClick={() => setIsSideBarOpen(!isSideBarOpen)}
          aria-expanded={isSideBarOpen ? "true" : "false"}
          aria-controls={"sidebar-content"}
          aria-label={"Toggle sidebar"}
        >
          <IconContext.Provider
            value={{ className: classNames(styles.sideBarIcon) }}
          >
            <GiHamburgerMenu aria-hidden={true} />
          </IconContext.Provider>
        </button>
      </div>
      <nav
        id={"sidebar-content"}
        aria-label="Sidebar Navigation"
        aria-hidden={!isSideBarOpen}
        className={classNames(styles.sideBarContentContainer)}
      >
        <div className={styles.sideBarContent}>
          <SideBarNavigationMenu setIsSideBarOpen={setIsSideBarOpen} />
        </div>
      </nav>
    </div>
  );
}

export function AppBar({
  "aria-hidden": ariaHidden,
}: {
  "aria-hidden"?: boolean;
}) {
  const { appBarVariant } = useContext(AppBarContext);

  const { t } = useTranslation("appbar");

  const navigate = useNavigate();

  return (
    <header
      className={classNames(
        appBarVariant === "default" && styles.appBarContainer,
        appBarVariant === "home" && homeAppBarStyles.appBarContainer,
        appBarVariant === "clean" && cleanAppBarStyles.appBarContainer,
      )}
      aria-hidden={ariaHidden}
    >
      <div
        className={classNames(
          appBarVariant === "default" && styles.appBar,
          appBarVariant === "home" && homeAppBarStyles.appBar,
          appBarVariant === "clean" && cleanAppBarStyles.appBar,
        )}
      >
        {appBarVariant !== "clean" && (
          <button
            aria-label={t("appbar:back")}
            className={
              appBarVariant === "home"
                ? homeAppBarStyles.backButton
                : styles.backButton
            }
            onClick={() => navigate(-1)}
          >
            {"<"}
          </button>
        )}
        {appBarVariant === "default" && (
          <div className={styles.homeButtonContainer}>
            <a
              href={"/"}
              aria-label={t("appbar:home")}
              className={styles.homeButton}
              onClick={(e) => {
                e.preventDefault();
                navigate("/");
              }}
            >
              <img src="icons/home_icon.svg" alt="Home Icon" />
            </a>
          </div>
        )}
        <div
          key="settingsButtons"
          className={
            appBarVariant === "home"
              ? homeAppBarStyles.settingsButtons
              : styles.settingsButtons
          }
        >
          <SettingsButton variant={appBarVariant} />
          <LanguageButton
            language={t("appbar:portugueseLanguage")}
            languageCode={"pt-PT"}
            variant={appBarVariant}
          />
          <LanguageButton
            language={t("appbar:englishLanguage")}
            languageCode={"en-GB"}
            variant={appBarVariant}
          />
        </div>
        {appBarVariant === "home" && (
          <>
            <GreetingsContainer />
          </>
        )}
      </div>
      {appBarVariant !== "clean" && <SideBar />}
      <GlobalStatusWidgets />
    </header>
  );
}
