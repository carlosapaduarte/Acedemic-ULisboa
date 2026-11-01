import React, { useState } from "react";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { LevelType } from "~/routes/log-in/SelectLevelPage/SelectLevelPage";
import { service } from "~/service/service";
import { Button } from "~/components/Button/Button";
import { useTranslation } from "react-i18next";

export default function QuizPage({
                                     userId,
                                     onLevelSelected
                                 }: {
    userId: number;
    onLevelSelected: () => void;
}) {
    // This component will display a total of 10 question.
    // Then, it will calculate a score based on the answers
    // Not fully implemented yet because the requirements are not yet fully decided

    const { t } = useTranslation(["login"]);
    const { onAnswerClick, computeLevel } = useQuizPage({ userId, onLevelSelected });

    return (
        <div>
            <h1>{t("login:quiz_intro")}</h1>
            <br />
            {Array.from({ length: 10 }, (_, questionNumber) => {
                return (
                    <div key={questionNumber}>
                        {t("login:quiz_question", { number: questionNumber + 1 })}{" "}
                        <Button variant={"round"}
                                onClick={() => onAnswerClick(questionNumber, true)}
                        >
                            {t("login:yes_answer_option")}
                        </Button>
                        <Button variant={"round"}
                                onClick={() => onAnswerClick(questionNumber, false)}
                        >
                            {t("login:no_answer_option")}
                        </Button>
                        <br />
                    </div>
                );
            })}
            <br />
            <button onClick={() => computeLevel()}>{t("login:confirm_answers")}</button>
        </div>
    );
}

function useQuizPage(
    {
        userId,
        onLevelSelected
    }: {
        userId: number;
        onLevelSelected: () => void;
    }
) {
    const [answers, setAnswers] = useState<boolean[]>(
        new Array(10).fill(undefined)
    );
    const setGlobalError = useSetGlobalError();

    function onAnswerClick(questionNumber: number, answer: boolean) {
        const newAnswers: boolean[] = answers.slice();
        newAnswers[questionNumber] = answer;
        setAnswers(newAnswers);
    }

    async function computeLevel() {
        // TODO: compute level based on answers
        const computedLevel: LevelType = LevelType.LEVEL_1;

        // TODO: handle in case of error later
        await service
            .createBatch(computedLevel) // returns if was successful or not
            .then(() => onLevelSelected())
            .catch((error) => setGlobalError(error));
    }

    return { onAnswerClick, computeLevel };
}