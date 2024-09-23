import { useState } from "react";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { service } from "~/service/service";
import styles from "./appUsagesSelectionPage.module.css";
import classNames from "classnames";

const questions = [
    "Melhorar as minhas notas/classificações",
    "Acompanhar o meu progresso",
    "Preparar-me para exames específicos",
    "Personalizar o meu plano de estudo",
    "Cumprir prazos e entregas",
    "Gerir os estudos com as outras áreas da minha vida"
];

function useAppUsagesSelection(
    {
        userId,
        onComplete
    }: {
        userId: number;
        onComplete: () => void;
    }) {
    const [selectedOptions, setSelectedOptions] = useState<Set<number>>(new Set([]));
    const setError = useSetGlobalError();

    function onInputValueChange(index: number) {
        const cur: Set<number> = new Set([...selectedOptions]);
        if (cur.has(index))
            cur.delete(index);
        else
            cur.add(index);
        setSelectedOptions(cur);
    }

    function submitAppUseGoals() {
        service.updateAppUseGoals(userId, selectedOptions)
            .then(() => onComplete())
            .catch((error) => setError(error));
    }

    return {
        onInputValueChange,
        submitAppUseGoals
    };
}

export function AppUsagesSelectionPage({ onProceed }: { onProceed: () => void }) {
    const { onInputValueChange, submitAppUseGoals } =
        useAppUsagesSelection({ userId: Number(localStorage["userId"]), onComplete: onProceed });

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageInnerContainer}>
                <h1>Objetivo de Utilização</h1>
                <div className={styles.optionsContainer}>
                    {questions.map((question: string, index: number) =>
                        <div key={index}>
                            <input type="checkbox" id={`goalOption-${index}`}
                                   onChange={() => onInputValueChange(index)} />
                            <label className={styles.optionLabel} htmlFor={`goalOption-${index}`}>{question}</label>
                        </div>
                    )}
                    <div className={styles.submitSelectionButtonContainer}>
                        <button className={classNames(styles.roundButton, styles.submitSelectionButton)}
                                onClick={submitAppUseGoals}>
                            Submit Selection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}