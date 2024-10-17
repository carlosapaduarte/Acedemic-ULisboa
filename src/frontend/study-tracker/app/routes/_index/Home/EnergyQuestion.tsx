import { useState } from "react";
import { Button, Input, Label, TextField } from "react-aria-components";
import { useTranslation } from "react-i18next";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { service } from "~/service/service";

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


export function HowMuchEnergyQuestionPage({ onComplete }: { onComplete: () => void }) {
    const { t } = useTranslation(["statistics"]);
    const { level, setLevel, onConfirmPressHandler } = useHowMuchEnergyQuestionPage(onComplete);

    return (
        <>
            <h1>
                {t("statistics:energy_question")}
            </h1>

            <br />

            <TextField autoFocus>
                <Label>
                    {t("statistics:energy_level")}
                </Label>
                <Input
                    value={level}
                    required type="number"
                    min={1}
                    max={10}
                    onChange={(e) => setLevel(Number(e.target.value))}
                />
            </TextField>

            <br />

            <Button onPress={onConfirmPressHandler}>
                {t("statistics:save")}
            </Button>
            <br />
            <Button onPress={onComplete}>
                {t("statistics:skip")}
            </Button>
        </>
    );
}