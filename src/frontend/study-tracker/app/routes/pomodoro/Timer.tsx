import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import useTimer from "react-timer-hook";
import { utils } from "~/utils";
import styles from "./pomodoroPage.module.css";
import { FaPause } from "react-icons/fa6";

export function Timer({
  title,
  stopDate,
  onStart,
  onStopClick,
  onFinish,
  currentCycle,
  totalCycles,
}: {
  title: string;
  stopDate: Date;
  onStart: () => void;
  onStopClick: (minutesElapsed: number) => void;
  onFinish: () => void;
  currentCycle?: number;
  totalCycles?: number;
}) {
  const { t } = useTranslation(["study"]);
  const [startDate, setStartDate] = useState(new Date());

  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const {
    seconds,
    minutes,
    hours,
    isRunning,
    start,
    pause,
    resume,
    restart,
  } = // @ts-ignore
    useTimer({ expiryTimestamp: stopDate, onExpire: () => onFinishRef.current() });

  useEffect(() => {
    onStart();
  }, []);

  useEffect(() => {
    restart(stopDate);
  }, [stopDate]);

  function onStopClickHandler() {
    const now = new Date();
    const minutesElapsed = utils.elapsedMinutes(now, startDate);
    setStartDate(now);
    onStopClick(minutesElapsed);
  }

  return (
    <div className={styles.pomodoroContainer}>
      <h1 className={styles.title}>{title}</h1>
      
      {currentCycle && totalCycles && (
        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-color-2)', opacity: 0.8 }}>
          {t("study:cycle_count", `Ciclo ${currentCycle} de ${totalCycles}`)}
        </div>
      )}

      {!isRunning && (
        <span
          className={styles.pausedIndicator}
          role="img"
          aria-label={t("study:timer_paused_accessible")}
        >
          <FaPause aria-hidden="true" />
        </span>
      )}

      <div className={styles.timerDisplay}>
        <span className={styles.timerText}>
          {hours.toString().padStart(2, "0")}
        </span>
        <span className={styles.timerText}>:</span>
        <span className={styles.timerText}>
          {minutes.toString().padStart(2, "0")}
        </span>
        <span className={styles.timerText}>:</span>
        <span className={styles.timerText}>
          {seconds.toString().padStart(2, "0")}
        </span>
      </div>
      
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.controlButton}
          onClick={isRunning ? pause : resume}
        >
          {isRunning ? t("study:timer_pause") : t("study:timer_resume")}
        </button>
        <div className="tutorial-target-pomodoro-start">
          <button
            type="button"
            className={styles.controlButton}
            onClick={onStopClickHandler}
          >
            {t("study:timer_stop")}
          </button>
        </div>
      </div>
    </div>
  );
}
