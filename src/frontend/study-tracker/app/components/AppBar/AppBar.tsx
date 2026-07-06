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
import { useTutorialMenu } from "~/components/Tutorial/TutorialContext";

function GlobalStatusWidgets() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(["appbar"]); 
  
  const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState<string | null>(null);
  const [streakWarning, setStreakWarning] = useState<string | null>(null);
  const [currentState, setCurrentState] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [isStreakWarningDismissed, setIsStreakWarningDismissed] = useState(false);
  
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

  // Textos dinâmicos com traduções
  const widgetColor = currentState === "pause" ? "#F39C12" : "#4CAF50";
  const widgetText = currentState === "pause" 
    ? t("appbar:status_pause", "☕ Em Pausa:") 
    : t("appbar:status_study", "⏱️ A Estudar:");

  return (
    <>
      {streakWarning && !isStreakWarningDismissed && (
        <div 
          className={styles.StreakWarning}
          onClick={() => {
            if (!isPomodoroRoute) {
              navigate('/pomodoro');
            }
          }}
          style={{
            cursor: isPomodoroRoute ? "default" : "pointer"
          }}
        >
          <span>{t("appbar:streak_warning", { time: streakWarning })}</span>
          
          <button 
            onClick={(e) => {
              e.stopPropagation(); 
              setIsStreakWarningDismissed(true);
            }}
            style={{ 
              background: "none", border: "none", color: "#5D4037", 
              fontWeight: "bold", fontSize: "1.1rem", cursor: "pointer", 
              display: "flex", alignItems: "center", justifyContent: "center", 
              padding: "0 4px" 
            }}
            aria-label={t("appbar:hide_warning", "Esconder aviso")}
          >
            ✕
          </button>
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
      <SideBarNavButton
        text={t("navigation:tasks")}
        url={"/tasks"}
        iconUrl={"icons/tasks_icon.png"}
        setIsSideBarOpen={setIsSideBarOpen}
      />
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
    </>
  );
}

function SideBar() {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const { appBarVariant } = useContext(AppBarContext);
  const menuRef = useRef<HTMLDivElement>(null);
  const { preventSidebarClose, registerSidebarSetter } = useTutorialMenu();
  const preventSidebarCloseRef = useRef(preventSidebarClose);
  const { t } = useTranslation(["appbar"]); 

  useEffect(() => {
    preventSidebarCloseRef.current = preventSidebarClose;
  }, [preventSidebarClose]);

  useEffect(() => {
    registerSidebarSetter(setIsSideBarOpen);
    return () => registerSidebarSetter(null);
  }, [registerSidebarSetter]);

  // detetor de cliques fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (preventSidebarCloseRef.current) {
        return;
      }
      const target = event.target as Node | null;
      if (
        target instanceof Element &&
        target.closest("[class*='react-joyride']")
      ) {
        return;
      }
      if (menuRef.current && target && !menuRef.current.contains(target)) {
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
          aria-label={t("appbar:toggle_sidebar", "Alternar menu")}
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

function AppSwitcher() {
    const location = useLocation();
    const isTrackerActuallyActive = !location.pathname.includes('/challenge');
    const [visualState, setVisualState] = useState(isTrackerActuallyActive);

    const toggleApp = () => {
        setVisualState(!visualState);
        setTimeout(() => {
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            if (isTrackerActuallyActive) {
                window.location.href = isLocalhost ? "http://localhost:5173/challenge/" : "https://acedemic.studentlife.ulisboa.pt/challenge/";
            } else {
                window.location.href = isLocalhost ? "http://localhost:5273/tracker/" : "https://acedemic.studentlife.ulisboa.pt/tracker/";
            }
        }, 300);
    };

    return (
        <div className={styles.switcherContainer} onClick={toggleApp} role="switch" aria-checked={visualState} title={visualState ? "Mudar para o Challenge" : "Mudar para o Tracker"}>
            <div className={classNames(styles.pill, visualState ? styles.pillTracker : styles.pillChallenge)} />
            
            <div className={styles.switcherIconContainer}>
                <img 
                    src="assets/logos/logo_tracker.png" 
                    alt="Tracker" 
                    className={classNames(styles.switcherLogo, visualState ? styles.iconActive : styles.iconInactive)} 
                />
            </div>
            
            <div className={styles.switcherIconContainer}>
                <img 
                    src="assets/logos/medal_icon.svg" 
                    alt="Challenge" 
                    className={classNames(styles.switcherLogo, styles.challengeLogo, !visualState ? styles.iconActive : styles.iconInactive)} 
                />
            </div>
        </div>
    );
}

// ------------------------------------------------------------------------
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
          
          <AppSwitcher />

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
          <SettingsButton variant={appBarVariant} />
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