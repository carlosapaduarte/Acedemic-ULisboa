import { service } from "~/service/service";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import styles from "./planDaySelectionPage.module.css";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { useWeekDayHourPicker, weekDays } from "~/hooks/useWeekDayHourPicker/useWeekDayHourPicker";

function usePlanDaySelection(onProceed: () => void) {
    const setGlobalError = useSetGlobalError();

    function submitPlanDaySelection(weekDay: number, hour: number) {
        service.updateWeekPlanningDay(weekDay, hour)
            .then(() => onProceed())
            .catch((error) => setGlobalError(error));
    }

    return { submitPlanDaySelection };
}

export function PlanDaySelectionPage({ onProceed }: { onProceed: () => void }) {
    const { t } = useTranslation(["login"]);

    const { submitPlanDaySelection } = usePlanDaySelection(onProceed);

    const { weekDay, hour, setWeekDay, setHour } = useWeekDayHourPicker();

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageInnerContainer}>
                <div className={styles.selectableItemsContainer}>
                    {weekDays.map((key: string, index: number) =>
                        <button key={index}
                                className={classNames(styles.roundButton, styles.weekDayButton)}
                                onClick={() => setWeekDay(index)}
                                aria-selected={weekDay == index}
                        >
                            {key}
                        </button>
                    )}

                    <div>
                        <label className={styles.hourLabel} htmlFor={"selectableHourField"}>Hour</label>
                        <input type="number" id={"selectableHourField"} min={0} max={23}
                               onChange={(e) => setHour(Number(e.target.value))} />
                    </div>

                    <button className={classNames(styles.roundButton)}
                            onClick={() => submitPlanDaySelection(weekDay!, hour!)}
                            disabled={weekDay == undefined || hour == undefined}>
                        {t("login:confirm")}
                    </button>
                </div>
            </div>
        </div>
    );
}

