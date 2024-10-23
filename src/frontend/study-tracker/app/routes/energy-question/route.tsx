import { useState } from "react";
import { Button, Input, Label, TextField } from "react-aria-components";
import { useTranslation } from "react-i18next";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { service } from "~/service/service";
import { getEnergyIconByEnergyLevel, levelToStr } from "../statistics/Energy";
import styles from "./energyQuestion.module.css";

function useHowMuchEnergyQuestionPage(onQuestionSubmitted: () => void) {
    const setError = useSetGlobalError();
    const [level, setLevel] = useState(1);

    function onConfirmPressHandler() {
        service.createDailyEnergyStat(level)
            .then(() => {
            })
            .catch((error) => setError(error));

        onQuestionSubmitted();
    }

    return { level, setLevel, onConfirmPressHandler };
}

export default function HowMuchEnergyQuestionPage({ onComplete }: { onComplete: () => void }) {
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

            <div className={styles.selectedEnergyLevelIconContainer}>
                <img src={getEnergyIconByEnergyLevel(energyLevel)} alt="Energy Status Icon" className={styles.selectedEnergyLevelIcon}/>
            </div>

            <div className={styles.energyLevelSelectedText}>
                {levelToStr(energyLevel)}
            </div>

            <TextField autoFocus>
                <Label>
                    {t("statistics:energy_level")}
                </Label>
                <Input
                    value={energyLevel}
                    required type="number"
                    min={1}
                    max={10}
                    onChange={(e) => setLevel(Number(e.target.value))}
                />
            </TextField>

            <br />

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