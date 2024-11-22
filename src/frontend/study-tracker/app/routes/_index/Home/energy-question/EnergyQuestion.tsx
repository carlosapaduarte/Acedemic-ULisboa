import { useState } from "react";
import { Button, Input, Label, TextField } from "react-aria-components";
import { useTranslation } from "react-i18next";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { service, TimeOfDay } from "~/service/service";
import { getEnergyIconByEnergyLevel, levelToStr } from "../../../statistics/Energy";
import styles from "./energyQuestion.module.css";

function useHowMuchEnergyQuestionPage(onQuestionSubmitted: () => void) {
    const setError = useSetGlobalError();
    const [level, setLevel] = useState(1);

    function onConfirmPressHandler() {
        function getCurTimeOfDay(): TimeOfDay {
            const now = new Date()
            const hour = now.getHours()
            if (hour < 12)
                return TimeOfDay.MORNING
            if (hour < 19)
                return TimeOfDay.AFTERNOON
            return TimeOfDay.NIGHT
        }

        const timeOfDay = getCurTimeOfDay()

        service.createDailyEnergyStat(level, timeOfDay)
            .catch((error) => setError(error));

        onQuestionSubmitted();
    }

    return { level, setLevel, onConfirmPressHandler };
}

export function HowMuchEnergyQuestionPage({ onComplete }: { onComplete: () => void }) {
    const { t } = useTranslation(["statistics"]);
    const { level: energyLevel, setLevel, onConfirmPressHandler } = useHowMuchEnergyQuestionPage(onComplete);

    return (
        <>
            <div className={styles.titleContainer}>
                {t("statistics:energy_question")}
            </div>

            <div className={styles.secondaryMessage}>
                {t("statistics:secondary_message")}
            </div>

            <br/>

            <div className={styles.selectedEnergyLevelIconContainer}>
                <img src={getEnergyIconByEnergyLevel(energyLevel)} alt="Energy Status Icon" className={styles.selectedEnergyLevelIcon}/>
            </div>

            <div className={styles.energyLevelSelectedText}>
                {levelToStr(energyLevel)}
            </div>

            <div className={styles.slideContainer}>
                <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={energyLevel} 
                    className={styles.slider} onChange={(e) => setLevel(Number(e.target.value))} 
                />
            </div>

            <div className={styles.sliderLegend}>
                <span>
                    {t("statistics:tired")}
                </span>
                <span>
                    {t("statistics:energetic")}
                </span>
            </div>

            <div className={styles.buttonsContainer}>
                <Button
                    onPress={onConfirmPressHandler} 
                    className={styles.saveButton}
                >
                    {t("statistics:save")}
                </Button>

                <Button 
                    onPress={onComplete}
                    className={styles.skipButton}
                >
                    {t("statistics:skip")}
                </Button>
            </div>

        </>
    );
}