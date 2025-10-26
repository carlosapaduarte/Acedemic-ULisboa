import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useTimer from "react-timer-hook";
import { utils } from "~/utils";
import styles from "./pomodoroPage.module.css";

export function Timer({
  title,
  stopDate,
  onStart,
  onStopClick,
  onFinish,
}: {
  title: string;
  stopDate: Date;
  onStart: () => void;
  onStopClick: (minutesElapsed: number) => void;
  onFinish: () => void;
}) {
  const { t } = useTranslation(["study"]);
  const [startDate, setStartDate] = useState(new Date());

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
    useTimer({ expiryTimestamp: stopDate, onExpire: onFinish });

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
      <p>{t("study:timer_title")}</p>
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
      <p className={styles.statusText}>
        {isRunning ? t("study:timer_running") : t("study:timer_paused")}
      </p>
      <div className={styles.controls}>
        <button className={styles.controlButton} onClick={start}>
          {t("study:timer_start")}
        </button>
        <button className={styles.controlButton} onClick={pause}>
          {t("study:timer_pause")}
        </button>
        <button className={styles.controlButton} onClick={resume}>
          {t("study:timer_resume")}
        </button>
        <button className={styles.controlButton} onClick={onStopClickHandler}>
          {t("study:timer_stop")}
        </button>
      </div>
    </div>
  );
}
