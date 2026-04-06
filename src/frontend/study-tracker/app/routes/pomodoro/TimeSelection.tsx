import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./pomodoroPage.module.css";

function useSelectTime(
  onTimeSelected: (studyStopDate: Date, pauseStopDate: Date) => void,
  initialStudy: number,
  initialPause: number,
) {
  const [studyMinutes, setStudyMinutes] = useState<number | string>(initialStudy);
  const [pauseMinutes, setPauseMinutes] = useState<number | string>(initialPause);

  function onConfirmButtonClick() {
    if (studyMinutes === "" || pauseMinutes === "") return;

    const safeStudy = Number(studyMinutes);
    const safePause = Number(pauseMinutes);

    const studyStopDate = new Date();
    studyStopDate.setMinutes(studyStopDate.getMinutes() + safeStudy);

    const pauseStopDate = new Date(studyStopDate);
    pauseStopDate.setMinutes(pauseStopDate.getMinutes() + safePause);

    onTimeSelected(studyStopDate, pauseStopDate);
  }

  return {
    studyMinutes,
    setStudyMinutes,
    pauseMinutes,
    setPauseMinutes,
    onConfirmButtonClick,
  };
}

interface SelectTimeProps {
  onTimeSelected: (studyStopDate: Date, pauseStopDate: Date) => void;
  initialStudyMinutes?: number;
  initialPauseMinutes?: number;
}

export function SelectTime({
  onTimeSelected,
  initialStudyMinutes = 25,
  initialPauseMinutes = 5,
}: SelectTimeProps) {
  const { t } = useTranslation(["study"]);

  const {
    studyMinutes,
    setStudyMinutes,
    pauseMinutes,
    setPauseMinutes,
    onConfirmButtonClick,
  } = useSelectTime(onTimeSelected, initialStudyMinutes, initialPauseMinutes);

  const isFormValid = studyMinutes !== "" && pauseMinutes !== "" && Number(studyMinutes) > 0 && Number(pauseMinutes) > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onConfirmButtonClick();
    }
  };

  return (
    <div className={styles.pomodoroContainer}>
      <form
        onSubmit={handleSubmit}
        className={`${styles.timeSelectionForm} tutorial-target-pomodoro-settings`}
      >
        <div className={styles.timeInputGroup}>
          <label className={styles.timeLabel}>
            {t("study:select_study_minutes", "Minutos de Estudo")}
          </label>
          <input
            className={styles.timeInput}
            type="text" 
            inputMode="numeric"
            required // Obriga a ter texto
            value={studyMinutes}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setStudyMinutes(val === "" ? "" : Number(val));
            }}
          />
        </div>
        <div className={styles.timeInputGroup}>
          <label className={styles.timeLabel}>
            {t("study:select_pause_minutes", "Minutos de Pausa")}
          </label>
          <input
            className={styles.timeInput}
            type="text" 
            inputMode="numeric"
            required // Obriga a ter texto
            value={pauseMinutes}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setPauseMinutes(val === "" ? "" : Number(val));
            }}
          />
        </div>
        
        <button
          type="submit"
          className={styles.confirmButton}
          disabled={!isFormValid}
          style={{ 
            opacity: isFormValid ? 1 : 0.5, 
            cursor: isFormValid ? "pointer" : "not-allowed" 
          }}
        >
          {t("study:confirm", "Confirmar e Iniciar")}
        </button>
      </form>
    </div>
  );
}