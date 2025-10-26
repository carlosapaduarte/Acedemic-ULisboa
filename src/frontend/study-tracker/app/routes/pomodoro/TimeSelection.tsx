import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./pomodoroPage.module.css";

function useSelectTime(
  onTimeSelected: (studyStopDate: Date, pauseStopDate: Date) => void
) {
  const [studyMinutes, setStudyMinutes] = useState(25);
  const [pauseMinutes, setPauseMinutes] = useState(5);

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

export function SelectTime({
  onTimeSelected,
}: {
  onTimeSelected: (studyStopDate: Date, pauseStopDate: Date) => void;
}) {
  const { t } = useTranslation(["study"]);

  const {
    studyMinutes,
    setStudyMinutes,
    pauseMinutes,
    setPauseMinutes,
    onConfirmButtonClick,
  } = useSelectTime(onTimeSelected);

  return (
    <div className={styles.pomodoroContainer}>
      <form className={styles.timeSelectionForm}>
        <div className={styles.timeInputGroup}>
          <label className={styles.timeLabel}>
            {t("study:select_study_minutes")}
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
            {t("study:select_pause_minutes")}
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
          {t("study:confirm")}
        </button>
      </form>
    </div>
  );
}
