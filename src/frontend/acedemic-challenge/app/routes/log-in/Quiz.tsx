import React, { useState } from "react";
import { useSetError } from "~/components/error/ErrorContainer";
import { LevelType } from "~/routes/log-in/SelectLevelPage";
import { service } from "~/service/service";

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
    "Question 10",
];

export default function Quiz({
    userId,
    onLevelSelected,
}: {
    userId: number;
    onLevelSelected: () => void;
}) {
    // This component will display a total of 10 question.
    // Then, it will calculate a score based on the answers
    // Not fully implemented yet because the requirements are not yet fully decided

    const [answers, setAnswers] = useState<boolean[]>(
        new Array(10).fill(undefined),
    );
    const setError = useSetError();

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
            .chooseLevel(userId, computedLevel) // returns if was successfull or not
            .then(() => onLevelSelected())
            .catch((error) => setError(error));
    }

    return (
        <div>
            <h1>10 questions to be displayed...</h1>
            <br />
            {quizQuestions.map((question, questionNumber) => {
                return (
                    <div key={questionNumber}>
                        {question}{" "}
                        <button
                            onClick={() => onAnswerClick(questionNumber, true)}
                        >
                            Sim!
                        </button>
                        <button
                            onClick={() => onAnswerClick(questionNumber, false)}
                        >
                            Não!
                        </button>
                        <br />
                    </div>
                );
            })}
            <br />
            <button onClick={() => computeLevel()}>Confirmar respostas!</button>
        </div>
    );
}
