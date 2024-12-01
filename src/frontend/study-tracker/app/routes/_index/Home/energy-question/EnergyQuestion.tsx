import { useEffect, useState } from "react";
import { Button } from "react-aria-components";
import { useTranslation } from "react-i18next";
import { service, TimeOfDay } from "~/service/service";
import { getEnergyIconByEnergyLevel, levelToStr } from "../../../statistics/Energy";
import styles from "./energyQuestion.module.css";
import { utils } from "~/utils";

function useHowMuchEnergyQuestionPage(onQuestionSubmitted: () => void) {
    const [level, setLevel] = useState(1);

    const [showSavedLevelMessage, setShowSavedLevelMessage] = useState(false);

    useEffect(() => {
        service.fetchEnergyHistory()
            .then((energyHistoryDaysStatus) => {
                if (energyHistoryDaysStatus.length > 0) {
                    const lastEnergyDayStatus = energyHistoryDaysStatus[energyHistoryDaysStatus.length - 1];
                    const today = new Date();
                    if (utils.sameDay(today, lastEnergyDayStatus.date)) {
                        setLevel(lastEnergyDayStatus.level);
                    }
                }
            })
            .catch((error) => {
            });
    }, []);

    function onConfirmPressHandler() {
        function getCurTimeOfDay(): TimeOfDay {
            const now = new Date();
            const hour = now.getHours();
            if (hour < 12)
                return TimeOfDay.MORNING;
            if (hour < 19)
                return TimeOfDay.AFTERNOON;
            return TimeOfDay.NIGHT;
        }

        const timeOfDay = getCurTimeOfDay();

        service.createDailyEnergyStat(level, timeOfDay)
            .then(() => {
                setShowSavedLevelMessage(true);
                setTimeout(() => {
                    setShowSavedLevelMessage(false);
                }, 2000);
            })
            .catch((error) => {
            });

        onQuestionSubmitted();
    }

    return { level, setLevel, onConfirmPressHandler, showSavedLevelMessage };
}

export function HowMuchEnergyQuestionPage({ onComplete }: { onComplete: () => void }) {
    const { t } = useTranslation(["statistics"]);
    const {
        level: energyLevel,
        setLevel,
        onConfirmPressHandler,
        showSavedLevelMessage
    } = useHowMuchEnergyQuestionPage(onComplete);

    return (
        <div className={styles.energyQuestionPage}>
            <div className={styles.titleContainer}>
                {t("statistics:energy_question")}
            </div>

            <div className={styles.secondaryMessage}>
                {t("statistics:secondary_message")}
            </div>

            <div className={styles.selectedEnergyLevelIconContainer}>
                <img src={getEnergyIconByEnergyLevel(energyLevel)} alt="Energy Status Icon"
                     className={styles.selectedEnergyLevelIcon} />
            </div>

            <div className={styles.energyLevelSelectedText}>
                {t(`statistics:${levelToStr(energyLevel)}`)}
            </div>

            <div className={styles.slideContainer}>
                <input
                    type="range"
                    min="1"
                    max="4"
                    value={energyLevel}
                    className={styles.slider} onChange={(e) => setLevel(Number(e.target.value))}
                />
                <div className={styles.sliderLegend}>
                <span>
                    {t("statistics:tired")}
                </span>
                    <span>
                    {t("statistics:energetic")}
                </span>
                </div>
            </div>

            {
                showSavedLevelMessage &&
                <div className={styles.savedLevelMessage}>
                    ✔️{t("statistics:saved_level_successfully")}
                </div>
            }
            <div className={styles.buttonsContainer}>
                <Button
                    onPress={onConfirmPressHandler}
                    className={styles.saveButton}
                >
                    {t("statistics:save")}
                </Button>

                {/*<Button
                    onPress={onComplete}
                    className={styles.skipButton}
                >
                    {t("statistics:skip")}
                </Button>*/}
            </div>

        </div>
    );
}