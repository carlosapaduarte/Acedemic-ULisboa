import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import styles from "./MoodTracker.module.css";
import { FaCheck, FaChevronLeft } from "react-icons/fa6";
import { service } from "~/service/service";

interface MoodStepProps {
  onComplete: () => void;
  onClose: () => void;
}

const MOOD_LEVELS = [
  { value: 1, label: "Muito Desagradável", color: "#6e67cf", icon: "😫" },
  { value: 2, label: "Desagradável", color: "#8a84e2", icon: "🙁" },
  { value: 3, label: "Neutro", color: "#aeb3be", icon: "😐" },
  { value: 4, label: "Agradável", color: "#66cdaa", icon: "🙂" },
  { value: 5, label: "Muito Agradável", color: "#ffa500", icon: "😄" },
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
  const { t } = useTranslation(["home"]);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [moodValue, setMoodValue] = useState(3);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedImpacts, setSelectedImpacts] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const randomQuote = useMemo(() => {
    return QUOTES[Math.floor(Math.random() * QUOTES.length)];
  }, []);

  const currentMood =
    MOOD_LEVELS.find((m) => m.value === moodValue) || MOOD_LEVELS[2];

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
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (list.includes(item)) setList(list.filter((i) => i !== item));
    else setList([...list, item]);
  };

  const saveData = async () => {
    setSaving(true);
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
              <FaChevronLeft /> {t("home:back", "Voltar")}
            </button>
          )}
        </div>
        <span className={styles.navTitle}>Log State of Mind</span>
        <div style={{ width: 80, display: "flex", justifyContent: "flex-end" }}>
          <button
            className={styles.navButton}
            onClick={onClose}
            style={{ fontWeight: 600 }}
          >
            {t("home:cancel", "Cancelar")}
          </button>
        </div>
      </div>
    );
  };

  // --- 1: SLIDER ---

  if (step === 1) {
    return (
      <div className={styles.overlay}>
        <div className={styles.sheetContainer}>
          {renderNavBar()}
          <div className={styles.content}>
            <h2 className={styles.title}>
              {t("home:mood_question", "Como te estás a sentir hoje?")}
            </h2>
            <div
              className={styles.moodVisual}
              style={{
                backgroundColor: currentMood.color,
                boxShadow: `0 0 40px ${currentMood.color}60`,
              }}
            >
              {currentMood.icon}
            </div>
            <h3 className={styles.subtitle}>{currentMood.label}</h3>
            <div className={styles.sliderContainer}>
              <div
                className={styles.sliderLabels}
                style={{ marginBottom: "10px" }}
              >
                <span>{t("home:very_unpleasant", "Muito Desagradável")}</span>
                <span>{t("home:very_pleasant", "Muito Agradável")}</span>
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
                {t("home:next", "Seguinte")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 2: EMOTIONS ---
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
                  fontSize: "1.5rem",
                  margin: "0 auto 1rem",
                  backgroundColor: currentMood.color,
                }}
              >
                {currentMood.icon}
              </div>
              <h3
                className={styles.subtitle}
                style={{ marginBottom: "0.5rem" }}
              >
                {currentMood.label}
              </h3>
              <p style={{ fontWeight: 600, color: "#555" }}>
                {t(
                  "home:emotions_question",
                  "O que descreve melhor este sentimento?"
                )}
              </p>
            </div>
            <div className={styles.tagsGrid}>
              {EMOTIONS_LIST.map((emotion) => (
                <button
                  key={emotion}
                  className={styles.tagButton}
                  data-selected={selectedEmotions.includes(emotion)}
                  onClick={() =>
                    toggleSelection(
                      emotion,
                      selectedEmotions,
                      setSelectedEmotions
                    )
                  }
                >
                  {emotion}
                </button>
              ))}
            </div>
            <div className={styles.footer}>
              <button className={styles.primaryButton} onClick={handleNext}>
                {t("home:next", "Seguinte")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 3: IMPACTS ---
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
                  fontSize: "1.5rem",
                  margin: "0 auto 1rem",
                  backgroundColor: currentMood.color,
                }}
              >
                {currentMood.icon}
              </div>
              <h3
                className={styles.subtitle}
                style={{ marginBottom: "0.5rem" }}
              >
                {currentMood.label}
              </h3>
              <p style={{ fontWeight: 600, color: "#555" }}>
                {t(
                  "home:impact_question",
                  "O que está a ter maior impacto em ti?"
                )}
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
                  {impact}
                </button>
              ))}
            </div>
            <div className={styles.footer}>
              <button
                className={styles.primaryButton}
                onClick={handleNext}
                disabled={saving}
              >
                {saving ? "A guardar..." : t("home:done", "Concluir")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 4: SUCCESS ---
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
              {t("home:mood_registered", "Mood de hoje registado!")}
            </h2>

            <div className={styles.quoteContainer}>
              <p className={styles.quoteText}>"{randomQuote.text}"</p>
              <span className={styles.quoteAuthor}>— {randomQuote.author}</span>
            </div>

            <div className={styles.footer} style={{ marginTop: "3rem" }}>
              <button className={styles.primaryButton} onClick={onComplete}>
                {t("home:go_dashboard", "Ir para a Dashboard")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
