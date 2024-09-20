import { service } from "~/service/service";
import { useSetError } from "~/components/error/ErrorContainer";
import { useWeekDayAndHourPicker, weekDays } from "../../commons";
import styles from "./planDaySelectionPage.module.css";
import { Button } from "~/components/Button/Button";

function usePlanDaySelection(onProceed: () => void) {
    const setError = useSetError();

    function submitPlanDaySelection(weekDay: number, hour: number) {
        const userIdStr = localStorage["userId"];
        const userId = Number(userIdStr);
        service.updateWeekPlanningDay(userId, weekDay, hour)
            .then(() => onProceed())
            .catch((error) => setError(error));
    }

    return { submitPlanDaySelection };
}

export function PlanDaySelectionPage({ onProceed }: { onProceed: () => void }) {
    const { submitPlanDaySelection } = usePlanDaySelection(onProceed);

    const { weekDay, hour, setWeekDay, setHour } = useWeekDayAndHourPicker();

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageInnerContainer}>
                <div className={styles.selectableItemsContainer}>
                    {weekDays.map((key: string, index: number) =>
                        <Button key={index} variant={"round"}
                                className={styles.weekDayButton}
                                onClick={() => setWeekDay(index)}
                                aria-selected={weekDay == index}
                        >
                            {key}
                        </Button>
                    )}

                    <div>
                        <label className={styles.hourLabel} htmlFor={"selectableHourField"}>Hour</label>
                        <input type="number" id={"selectableHourField"} min={0} max={23}
                               onChange={(e) => setHour(Number(e.target.value))} />
                    </div>

                    <Button variant={"round"} onClick={() => submitPlanDaySelection(weekDay!, hour!)}
                            disabled={weekDay == undefined || hour == undefined}>
                        Confirm
                    </Button>
                </div>
            </div>
        </div>
    );
}

