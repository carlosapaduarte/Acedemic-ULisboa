import React, { useEffect, useState } from "react";
import styles from "./homePage.module.css";
import widgetStyles from "./MoodTracker/MoodTracker.module.css";
import { useAppBar } from "~/components/AppBar/AppBarProvider";
import { useTranslation } from "react-i18next";
import { MoodTrackerFlow } from "./MoodTracker/MoodTrackerFlow";
import { FaPen, FaCheckCircle } from "react-icons/fa";

const STORAGE_KEY = "mood_tracker_log_v1";

function useHomePage() {
  const [isMoodLogged, setIsMoodLogged] = useState<boolean>(false);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);

  useEffect(() => {
    // Verifica no localStorage se já existe registo com a nova chave
    const promptedState = localStorage.getItem(STORAGE_KEY);

    if (promptedState) {
      const prompted = new Date(promptedState);
      const today = new Date();

      // Compara Dia, Mês e Ano para garantir que é HOJE
      const hasAnsweredToday =
        today.getFullYear() === prompted.getFullYear() &&
        today.getMonth() === prompted.getMonth() &&
        today.getDate() === prompted.getDate();

      setIsMoodLogged(hasAnsweredToday);
    } else {
      setIsMoodLogged(false);
    }
  }, []);

  const openTracker = () => setIsSheetOpen(true);

  const closeTracker = () => setIsSheetOpen(false);

  const completeTracker = () => {
    const today = new Date();
    localStorage.setItem(STORAGE_KEY, today.toISOString());
    setIsMoodLogged(true);
    setIsSheetOpen(false);
  };

  return {
    isMoodLogged,
    isSheetOpen,
    openTracker,
    closeTracker,
    completeTracker,
  };
}

export default function HomePage() {
  const { t } = useTranslation(["home"]);
  const {
    isMoodLogged,
    isSheetOpen,
    openTracker,
    closeTracker,
    completeTracker,
  } = useHomePage();

  useAppBar("home");

  return (
    <div className={styles.homePage}>
      <div
        style={{ padding: "1rem", display: "flex", justifyContent: "center" }}
      >
        {!isMoodLogged ? (
          // ESTADO 1: AINDA NÃO REGISTOU HOJE
          <div className={widgetStyles.widgetCard}>
            <h3 className={widgetStyles.widgetTitle}>
              {t("home:mood_question_short", "Como te sentes hoje?")}
            </h3>
            <p className={widgetStyles.widgetSubtitle}>
              Regista o teu estado de espírito para acompanhares o teu
              progresso.
            </p>
            <button className={widgetStyles.widgetButton} onClick={openTracker}>
              {t("home:log_mood_button", "Registar Mood")}
            </button>
          </div>
        ) : (
          <div
            className={`${widgetStyles.widgetCard} ${widgetStyles.completedCard}`}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "8px",
                color: "#4cd964",
              }}
            >
              <FaCheckCircle size={20} />
              <span style={{ fontWeight: 700 }}>Mood Registado</span>
            </div>
            <p
              className={widgetStyles.widgetSubtitle}
              style={{ marginBottom: "1rem" }}
            >
              O teu registo de hoje está guardado.
            </p>
            <button className={widgetStyles.editButton} onClick={openTracker}>
              <FaPen size={12} />
              {t("home:edit_mood", "Editar Registo")}
            </button>
          </div>
        )}
      </div>

      <div style={{ padding: "0 2rem", textAlign: "center", color: "#666" }}>
        <h2>{t("home:welcome_back", "Bem-vindo de volta!")}</h2>
        <p>
          {t(
            "home:main_content_placeholder",
          )}
        </p>
      </div>

      {isSheetOpen && (
        <MoodTrackerFlow onComplete={completeTracker} onClose={closeTracker} />
      )}
    </div>
  );
}
