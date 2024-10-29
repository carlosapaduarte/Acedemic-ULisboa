import React, { useState } from "react";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { LevelType } from "~/routes/log-in/SelectLevelPage/SelectLevelPage";
import { service } from "~/service/service";
import { Button } from "~/components/Button/Button";

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

    const { onAnswerClick, computeLevel } = useQuizPage({ userId, onLevelSelected });

    return (
        <div>
            <h1>10 questions to be displayed...</h1>
            <br />
            {quizQuestions.map((question, questionNumber) => {
                return (
                    <div key={questionNumber}>
                        {question}{" "}
                        <Button variant={"round"}
                                onClick={() => onAnswerClick(questionNumber, true)}
                        >
                            Sim!
                        </Button>
                        <Button variant={"round"}
                                onClick={() => onAnswerClick(questionNumber, false)}
                        >
                            Não!
                        </Button>
                        <br />
                    </div>
                );
            })}
            <br />
            <button onClick={() => computeLevel()}>Confirmar respostas!</button>
        </div>
    );
}

const quizQuestions = [
    "Question 1",
    "Question 2",
    "Question 3",
    "Question 4",
    "Question 5",
    "Question 6",
    "Question 7",
    "Question 8",
    "Question 9",
    "Question 10"
];

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