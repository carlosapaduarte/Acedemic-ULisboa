import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./pomodoroPage.module.css";

function useSelectTime(
  onTimeSelected: (studyMins: number, pauseMins: number, cycles: number) => void,
  initialStudy: number,
  initialPause: number,
  initialCycles: number
) {
  const [studyMinutes, setStudyMinutes] = useState<number | string>(initialStudy);
  const [pauseMinutes, setPauseMinutes] = useState<number | string>(initialPause);
  const [cycles, setCycles] = useState<number | string>(initialCycles);

  function onConfirmButtonClick() {
    if (studyMinutes === "" || pauseMinutes === "" || cycles === "") return;
    onTimeSelected(Number(studyMinutes), Number(pauseMinutes), Number(cycles));
  }

  return {
    studyMinutes, setStudyMinutes,
    pauseMinutes, setPauseMinutes,
    cycles, setCycles,
    onConfirmButtonClick,
  };
}

interface SelectTimeProps {
  onTimeSelected: (studyMins: number, pauseMins: number, cycles: number) => void;
  initialStudyMinutes?: number;
  initialPauseMinutes?: number;
  initialCycles?: number;
}

export function SelectTime({
  onTimeSelected,
  initialStudyMinutes = 25,
  initialPauseMinutes = 5,
  initialCycles = 1,
}: SelectTimeProps) {
  const { t } = useTranslation(["study"]);
  const {
    studyMinutes, setStudyMinutes,
    pauseMinutes, setPauseMinutes,
    cycles, setCycles,
    onConfirmButtonClick,
  } = useSelectTime(onTimeSelected, initialStudyMinutes, initialPauseMinutes, initialCycles);

  const isFormValid =
    studyMinutes !== "" && pauseMinutes !== "" && cycles !== "" &&
    Number(studyMinutes) > 0 && Number(pauseMinutes) > 0 && Number(cycles) > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) onConfirmButtonClick();
  };

  const btnStyle = {
    width: "40px", height: "40px", borderRadius: "5px", 
    backgroundColor: "var(--color-2)", color: "var(--color-3)", 
    fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "1.2rem"
  };

  return (
    <div className={styles.pomodoroContainer}>
      <form onSubmit={handleSubmit} className={`${styles.timeSelectionForm} tutorial-target-pomodoro-settings`}>
        <div className={styles.timeInputGroup}>
          <label className={styles.timeLabel}>{t("study:select_study_minutes", "Minutos de Estudo")}</label>
          <input
            className={styles.timeInput} type="text" inputMode="numeric" required value={studyMinutes}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setStudyMinutes(val === "" ? "" : Number(val));
            }}
          />
        </div>
        
        <div className={styles.timeInputGroup}>
          <label className={styles.timeLabel}>{t("study:select_pause_minutes", "Minutos de Pausa")}</label>
          <input
            className={styles.timeInput} type="text" inputMode="numeric" required value={pauseMinutes}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setPauseMinutes(val === "" ? "" : Number(val));
            }}
          />
        </div>

        <div className={styles.timeInputGroup}>
          <label className={styles.timeLabel}>{t("study:select_cycles", "Número de Ciclos")}</label>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", justifyContent: "center" }}>
            <button type="button" style={btnStyle} onClick={() => setCycles(Math.max(1, Number(cycles) - 1))}>-</button>
            <input
              className={styles.timeInput} type="text" inputMode="numeric" required value={cycles} style={{ width: "80px" }}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setCycles(val === "" ? "" : Number(val));
              }}
            />
            <button type="button" style={btnStyle} onClick={() => setCycles(Number(cycles) + 1)}>+</button>
          </div>
        </div>
        
        <button
          type="submit" className={styles.confirmButton} disabled={!isFormValid}
          style={{ opacity: isFormValid ? 1 : 0.5, cursor: isFormValid ? "pointer" : "not-allowed" }}
        >
          {t("study:confirm", "Confirmar e Iniciar")}
        </button>
      </form>
    </div>
  );
}