import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { service } from "~/service/service";
import { useSetIsLoggedIn } from "~/components/auth/Authn";
import { useSetError } from "~/components/error/ErrorContainer";
import { LevelType, SelectLevelComponent } from "~/components/SelectLevel";
import AvatarSelection from "~/components/Avatar";

type Views =
    | "userInfo"
    | "shareProgress"
    | "chooseLevel"
    | "quiz"
    | "selectAvatar"
    | "redirect";

/**
 * This React component:
 * - shows a dialogue to simulate authentication;
 * - asks user if can share progress;
 * - lists possible levels:
 *  - User might choose to start quiz
 * - redirects for calendar component.
 */

function LogIn() {
    const [currentView, setCurrentView] = useState<Views>("userInfo");
    const [userId, setUserId] = useState<number | undefined>(undefined);

    switch (currentView) {
        case "userInfo":
            return (
                <UserInfo
                    onAuthDone={(userId) => {
                        setCurrentView("shareProgress");
                        setUserId(userId);
                    }}
                />
            );
        case "shareProgress":
            return (
                <ShareProgress
                    userId={userId!}
                    onShareSelected={() => setCurrentView("chooseLevel")}
                />
            );
        case "chooseLevel":
            return (
                <SelectLevel
                    userId={userId!}
                    onLevelSelected={() => setCurrentView("selectAvatar")}
                    onStartQuizClick={() => setCurrentView("quiz")}
                />
            );
        case "quiz":
            return (
                <Quiz
                    userId={userId!}
                    onLevelSelected={() => setCurrentView("selectAvatar")}
                />
            );
        case "selectAvatar":
            return (
                <Avatar
                    userId={userId!}
                    onComplete={() => setCurrentView("redirect")}
                />
            );
        case "redirect":
            return <Navigate to={`/dashboard/${userId}`} replace={true} />;
        default:
            return <h1>Should not have arrived here!</h1>;
    }
}

const MAX_USER_ID = 9999;

function UserInfo({ onAuthDone }: { onAuthDone: (userId: number) => void }) {
    const { userId, createUser } = useUserInfo();

    return (
        <div className="flex h-full w-full flex-row items-center justify-center sm:h-1/2">
            <div className="mx-[5%] my-[10%] flex h-full w-full flex-col items-center justify-center md:w-3/4 lg:w-1/2">
                {userId != undefined ? (
                    <>
                        <h1 className="text-4xl font-bold text-secondary">
                            User created!
                        </h1>
                        <button
                            className="rnd-button"
                            onClick={() => onAuthDone(userId)}
                        >
                            Click here to advance
                        </button>
                    </>
                ) : (
                    <>
                        <h1 className="text-4xl font-bold text-secondary">
                            Create New User
                        </h1>
                        <button
                            className="rnd-button"
                            onClick={() => createUser()}
                        >
                            Click To Create user
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

function useUserInfo() {
    const setIsLoggedIn = useSetIsLoggedIn();
    const setError = useSetError();

    // This function should redirect user to ULisboa authentication page,
    // so he can obtain an access token

    const [userId, setUserId] = useState<number | undefined>(undefined);

    async function createUser() {
        const userId = Math.floor(Math.random() * MAX_USER_ID);
        await service
            .createUserOrLogin(userId)
            .then(() => {
                // TODO: this is a solution just for now!!! Later, we won't be storing the user ID in cache
                localStorage["userId"] = userId.toString();
                /*setIsLoggedIn(true);*/ // Sets - user logged in - in auth container
                setUserId(userId);
            })
            .catch((error) => setError(error));
    }

    return { userId, createUser };
}

function ShareProgress({
    userId,
    onShareSelected,
}: {
    userId: number;
    onShareSelected: () => void;
}) {
    const setError = useSetError();

    async function selectShareProgressState(shareProgress: boolean) {
        await service
            .selectShareProgressState(userId, shareProgress)
            .then(() => onShareSelected())
            .catch((error) => setError(error));
    }

    return (
        <div className="flex h-full w-full flex-row items-center justify-center sm:h-1/2">
            <div className="mx-[5%] my-[10%] flex h-full w-full flex-col items-center justify-center md:w-3/4 lg:w-1/2">
                <h1 className="text-4xl font-bold text-secondary">
                    Do you want to share your progress?
                </h1>
                <br />
                <button
                    className="rnd-button mb-2 h-8"
                    onClick={() => selectShareProgressState(true)}
                >
                    Yes
                </button>
                <button
                    className="rnd-button h-8"
                    onClick={() => selectShareProgressState(false)}
                >
                    No
                </button>
            </div>
        </div>
    );
}

function SelectLevel({
    userId,
    onLevelSelected,
    onStartQuizClick,
}: {
    userId: number;
    onLevelSelected: () => void;
    onStartQuizClick: () => void;
}) {
    const setError = useSetError();

    async function chooseLevelLocal(level: LevelType) {
        await service
            .chooseLevel(userId, level) // returns if was successfull or not
            .then(() => onLevelSelected())
            .catch((error) => setError(error));
    }

    // For now, no confirm button...
    // For now, no quiz button...
    // TODO

    return <SelectLevelComponent.SelectLevel onLevelClick={chooseLevelLocal} />;
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
    "Question 10",
];

function Quiz({
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

function Avatar({
    userId,
    onComplete,
}: {
    userId: number;
    onComplete: () => void;
}) {
    const setError = useSetError();

    async function onAvatarClickHandler(avatarFilename: string) {
        await service
            .selectAvatar(userId, avatarFilename)
            .then(() => onComplete())
            .catch((error) => setError(error));
    }

    return <AvatarSelection onAvatarClick={onAvatarClickHandler} />;
}

export default LogIn;
