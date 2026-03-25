import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import styles from "./MoodTracker.module.css";
import { FaCheck, FaChevronLeft } from "react-icons/fa6";
import { service } from "~/service/service";
import { useEffect } from "react";

interface MoodStepProps {
  onComplete: () => void;
  onClose: () => void;
}

const MOOD_LEVELS = [
  {
    value: 1,
    label: "Muito Desagradável",
    color: "#6e67cf",
    icon: "./icons/MoodTracker/energy_very_bad_icon.png",
  },
  {
    value: 2,
    label: "Desagradável",
    color: "#8a84e2",
    icon: "./icons/MoodTracker/energy_bad_icon.png",
  },
  {
    value: 3,
    label: "Neutro",
    color: "#aeb3be",
    icon: "./icons/MoodTracker/energy_container_title_icon.png",
  },
  {
    value: 4,
    label: "Agradável",
    color: "#66cdaa",
    icon: "./icons/MoodTracker/energy_well_icon.png",
  },
  {
    value: 5,
    label: "Muito Agradável",
    color: "#ffa500",
    icon: "./icons/MoodTracker/energy_very_well_icon.png",
  },
];

const EMOTIONS_LIST = [
  "Ansioso",
  "Stressado",
  "Cansado",
  "Frustrado",
  "Triste",
  "Calmo",
  "Focado",
  "Confiante",
  "Entusiasmado",
  "Feliz",
  "Indiferente",
  "Aborrecido",
  "Grato",
  "Orgulhoso",
];

const IMPACT_LIST = [
  "Estudo",
  "Trabalho",
  "Família",
  "Amigos",
  "Saúde",
  "Sono",
  "Dinheiro",
  "Tempo",
  "Auto-estima",
  "Acontecimentos Atuais",
  "Outro",
];

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
];

export const MoodTrackerFlow = ({ onComplete, onClose }: MoodStepProps) => {
  const { t } = useTranslation(["mood_tracker"]);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [moodValue, setMoodValue] = useState(3);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedImpacts, setSelectedImpacts] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [showAllEmotions, setShowAllEmotions] = useState(false);

  const randomQuote = useMemo(() => {
    return QUOTES[Math.floor(Math.random() * QUOTES.length)];
  }, []);

  const currentMood =
    MOOD_LEVELS.find((m) => m.value === moodValue) || MOOD_LEVELS[2];

  const filteredEmotions = useMemo(() => {
    if (showAllEmotions || moodValue === 3) return EMOTIONS_LIST;

    const isPositive = moodValue > 3;
    const positiveEmotions = [
      "Calmo",
      "Focado",
      "Confiante",
      "Entusiasmado",
      "Feliz",
      "Grato",
      "Orgulhoso",
    ];
    const negativeEmotions = [
      "Ansioso",
      "Stressado",
      "Cansado",
      "Frustrado",
      "Triste",
      "Aborrecido",
    ];

    return EMOTIONS_LIST.filter((emotion) => {
      if (isPositive)
        return positiveEmotions.includes(emotion) || emotion === "Indiferente";
      return negativeEmotions.includes(emotion) || emotion === "Indiferente";
    });
  }, [moodValue, showAllEmotions]);

  const handleNext = async () => {
    if (step < 3) {
      // @ts-ignore
      setStep((prev) => prev + 1);
    } else if (step === 3) {
      await saveData();
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 1 && step < 4) {
      // @ts-ignore
      setStep((prev) => prev - 1);
    }
  };

  const toggleSelection = (
    item: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    if (list.includes(item)) setList(list.filter((i) => i !== item));
    else setList([...list, item]);
  };

  // 🕵️‍♀️ Espião: Quando o MoodTracker renderiza, conta como intenção de abrir
  useEffect(() => {
      service.logUserAction("tracker", "intent", "open_mood_modal");
  }, []);
  
  const saveData = async () => {
    setSaving(true);
    
    // 🕵️‍♀️ Espião: Quando efetivamente guardam
    service.logUserAction("tracker", "action", "save_mood");

    try {
      const payload = {
        value: moodValue,
        label: currentMood.label,
        emotions: selectedEmotions,
        impacts: selectedImpacts,
        date: new Date(),
      };
      await service.saveMood(payload);
      setStep(4);
    } catch (error) {
      console.error("Erro ao guardar mood:", error);
    } finally {
      setSaving(false);
    }
  };

  const renderNavBar = () => {
    if (step === 4) return null;
    return (
      <div className={styles.navBar}>
        <div style={{ width: 80 }}>
          {step > 1 && (
            <button className={styles.navButton} onClick={handleBack}>
              <FaChevronLeft /> {t("mood_tracker:back")}
            </button>
          )}
        </div>
        <span className={styles.navTitle}>
          {t("mood_tracker:log_state_of_mind")}
        </span>
        <div style={{ width: 80, display: "flex", justifyContent: "flex-end" }}>
          <button
            className={styles.navButton}
            onClick={onClose}
            style={{ fontWeight: 600 }}
          >
            {t("mood_tracker:cancel")}
          </button>
        </div>
      </div>
    );
  };

  const formatKey = (str: string) => str.toLowerCase().replace(/[\s-]/g, "_");

  if (step === 1) {
    return (
      <div className={styles.overlay}>
        <div className={styles.sheetContainer}>
          {renderNavBar()}
          <div className={styles.content}>
            <h2 className={styles.title}>{t("mood_tracker:mood_question")}</h2>
            <div
              className={styles.moodVisual}
              style={{
                backgroundColor: currentMood.color,
                boxShadow: `0 0 40px ${currentMood.color}60`,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "15px",
              }}
            >
              <img
                src={currentMood.icon}
                alt={t(`mood_tracker:mood_level_${currentMood.value}`)}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <h3 className={styles.subtitle}>
              {t(`mood_tracker:mood_level_${currentMood.value}`)}
            </h3>
            <div className={styles.sliderContainer}>
              <div
                className={styles.sliderLabels}
                style={{ marginBottom: "10px" }}
              >
                <span>{t("mood_tracker:very_unpleasant")}</span>
                <span>{t("mood_tracker:very_pleasant")}</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={moodValue}
                onChange={(e) => setMoodValue(Number(e.target.value))}
                className={styles.slider}
                style={{ accentColor: currentMood.color }}
              />
            </div>
            <div className={styles.footer}>
              <button className={styles.primaryButton} onClick={handleNext}>
                {t("mood_tracker:next")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className={styles.overlay}>
        <div className={styles.sheetContainer}>
          {renderNavBar()}
          <div className={styles.content}>
            <div className={styles.header}>
              <div
                className={styles.moodVisual}
                style={{
                  width: 60,
                  height: 60,
                  margin: "0 auto 1rem",
                  backgroundColor: currentMood.color,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "8px",
                }}
              >
                <img
                  src={currentMood.icon}
                  alt={t(`mood_tracker:mood_level_${currentMood.value}`)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
              <h3
                className={styles.subtitle}
                style={{ marginBottom: "0.5rem" }}
              >
                {t(`mood_tracker:mood_level_${currentMood.value}`)}
              </h3>
              <p style={{ fontWeight: 600, color: "#555" }}>
                {t("mood_tracker:emotions_question")}
              </p>
            </div>
            <div className={styles.tagsGrid}>
              {filteredEmotions.map((emotion) => (
                <button
                  key={emotion}
                  className={styles.tagButton}
                  data-selected={selectedEmotions.includes(emotion)}
                  onClick={() =>
                    toggleSelection(
                      emotion,
                      selectedEmotions,
                      setSelectedEmotions,
                    )
                  }
                >
                  {t(`mood_tracker:emotion_${formatKey(emotion)}`)}
                </button>
              ))}
            </div>

            {!showAllEmotions && moodValue !== 3 && (
              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <button
                  onClick={() => setShowAllEmotions(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-2)",
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  {t("mood_tracker:show_all_emotions")}
                </button>
              </div>
            )}

            <div className={styles.footer}>
              <button className={styles.primaryButton} onClick={handleNext}>
                {t("mood_tracker:next")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className={styles.overlay}>
        <div className={styles.sheetContainer}>
          {renderNavBar()}
          <div className={styles.content}>
            <div className={styles.header}>
              <div
                className={styles.moodVisual}
                style={{
                  width: 60,
                  height: 60,
                  margin: "0 auto 1rem",
                  backgroundColor: currentMood.color,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "8px",
                }}
              >
                <img
                  src={currentMood.icon}
                  alt={t(`mood_tracker:mood_level_${currentMood.value}`)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
              <h3
                className={styles.subtitle}
                style={{ marginBottom: "0.5rem" }}
              >
                {t(`mood_tracker:mood_level_${currentMood.value}`)}
              </h3>
              <p style={{ fontWeight: 600, color: "#555" }}>
                {t("mood_tracker:impact_question")}
              </p>
            </div>
            <div className={styles.tagsGrid}>
              {IMPACT_LIST.map((impact) => (
                <button
                  key={impact}
                  className={styles.tagButton}
                  data-selected={selectedImpacts.includes(impact)}
                  onClick={() =>
                    toggleSelection(impact, selectedImpacts, setSelectedImpacts)
                  }
                >
                  {t(`mood_tracker:impact_${formatKey(impact)}`)}
                </button>
              ))}
            </div>
            <div className={styles.footer}>
              <button
                className={styles.primaryButton}
                onClick={handleNext}
                disabled={saving}
              >
                {saving ? t("mood_tracker:saving") : t("mood_tracker:done")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className={styles.overlay}>
        <div
          className={styles.sheetContainer}
          style={{ justifyContent: "center", backgroundColor: "white" }}
        >
          <div className={styles.content} style={{ justifyContent: "center" }}>
            <div className={styles.successIconContainer}>
              <FaCheck />
            </div>
            <h2
              className={styles.title}
              style={{ fontSize: "1.5rem", marginBottom: "2rem" }}
            >
              {t("mood_tracker:mood_registered")}
            </h2>

            <div className={styles.quoteContainer}>
              <p className={styles.quoteText}>"{randomQuote.text}"</p>
              <span className={styles.quoteAuthor}>— {randomQuote.author}</span>
            </div>

            <div className={styles.footer} style={{ marginTop: "3rem" }}>
              <button className={styles.primaryButton} onClick={onComplete}>
                {t("mood_tracker:go_dashboard")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
