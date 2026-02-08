import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./pomodoroPage.module.css";

function useSelectTime(
  onTimeSelected: (studyStopDate: Date, pauseStopDate: Date) => void,
  initialStudy: number,
  initialPause: number,
) {
  const [studyMinutes, setStudyMinutes] = useState(initialStudy);
  const [pauseMinutes, setPauseMinutes] = useState(initialPause);

  function onConfirmButtonClick() {
    const studyStopDate = new Date();
    studyStopDate.setMinutes(studyStopDate.getMinutes() + studyMinutes);

    const pauseStopDate = new Date(studyStopDate);
    pauseStopDate.setMinutes(pauseStopDate.getMinutes() + pauseMinutes);

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
  initialStudyMinutes = 25, // Default se não vier nada
  initialPauseMinutes = 5, // Default se não vier nada
}: SelectTimeProps) {
  const { t } = useTranslation(["study"]);

  const {
    studyMinutes,
    setStudyMinutes,
    pauseMinutes,
    setPauseMinutes,
    onConfirmButtonClick,
  } = useSelectTime(onTimeSelected, initialStudyMinutes, initialPauseMinutes);

  return (
    <div className={styles.pomodoroContainer}>
      <form
        className={`${styles.timeSelectionForm} tutorial-target-pomodoro-settings`}
      >
        <div className={styles.timeInputGroup}>
          <label className={styles.timeLabel}>
            {t("study:select_study_minutes", "Minutos de Estudo")}
          </label>
          <input
            className={styles.timeInput}
            type="number"
            value={studyMinutes}
            min="1"
            onChange={(e) => setStudyMinutes(Number(e.target.value))}
          />
        </div>
        <div className={styles.timeInputGroup}>
          <label className={styles.timeLabel}>
            {t("study:select_pause_minutes", "Minutos de Pausa")}
          </label>
          <input
            className={styles.timeInput}
            type="number"
            value={pauseMinutes}
            min="1"
            onChange={(e) => setPauseMinutes(Number(e.target.value))}
          />
        </div>
        <button
          type="button"
          className={styles.confirmButton}
          onClick={onConfirmButtonClick}
        >
          {t("study:confirm", "Confirmar e Iniciar")}
        </button>
      </form>
    </div>
  );
}
