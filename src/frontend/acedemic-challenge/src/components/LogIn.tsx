import React, {useReducer, useState} from "react";
import {Navigate} from 'react-router-dom';
import {service} from '../service/service';
import {useSetIsLoggedIn} from "./auth/Authn";
import { useSetError } from "./error/ErrorContainer";
import { Box, Typography } from "@mui/material";
import { t } from "i18next";
import { LevelType, SelectLevelComponent } from "./SelectLevel";
import { LanguageVariant } from "typescript";
import AvatarSelection from "./Avatar";

type State =
    {
        type: "userInfo",
    }
    |
    {
        type: "shareProgress",
        userId: number
    }
    |
    {
        type: "chooseLevel",
        userId: number
    }
    |
    {
        type: "quiz",
        userId: number
    }
    |
    {
        type: "selectAvatar",
        userId: number
    }
    |
    {
        type: "redirect",
        userId: number
    }

type Action =
    {
        type: "setShareProgress",
        userId: number
    }
    |
    {
        type: "setChooseLevel",
        userId: number
    }
    |
    {
        type: "setQuiz",
        userId: number
    }
    |
    {
        type: "setSelectAvatar",
        userId: number
    }
    |
    {
        type: "setRedirect",
        userId: number
    }

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "setShareProgress": {
            return {type: "shareProgress", userId: action.userId}
        }
        case "setChooseLevel": {
            return {type: "chooseLevel", userId: action.userId}
        }
        case "setQuiz": {
            return {type: "quiz", userId: action.userId}
        }
        case "setSelectAvatar": {
            return {type: "selectAvatar", userId: action.userId}
        }
        case "setRedirect": {
            return {type: "redirect", userId: action.userId}
        }
    }
}

/**
 * This React component:
 * - shows a dialogue to simulate authentication;
 * - asks user if can share progress;
 * - lists possible levels:
 *  - User might choose to start quiz
 * - redirects for calendar component.
 */

function LogIn() {
    const [state, dispatch] = useReducer(reducer, {type: 'userInfo'})

    const onAuthDoneHandler = (userId: number) => {
        dispatch({type: 'setShareProgress', userId})
    };

    const handleOnShareClick = (userId: number) => {
        dispatch({type: 'setChooseLevel', userId})
    };

    const onStartQuizCLickHandler = (userId: number) => {
        dispatch({type: 'setQuiz', userId})
    }

    if (state.type === 'userInfo')
        return <UserInfo onAuthDone={onAuthDoneHandler}/>
    else if (state.type === "shareProgress")
        return <ShareProgress userId={state.userId} onShareSelected={() => handleOnShareClick(state.userId)}/>
    else if (state.type === "chooseLevel")
        return <CreateBatch userId={state.userId}
                    onLevelSelected={() => dispatch({type: 'setSelectAvatar', userId: state.userId})}
                    onStartQuizClick={() => onStartQuizCLickHandler(state.userId)}/>
    else if (state.type === "quiz")
        return <Quiz userId={state.userId}
            onLevelSelected={() => dispatch({type: 'setSelectAvatar', userId: state.userId})}/>
    else if (state.type === "selectAvatar")
        return <Avatar userId={state.userId} onComplete={() => dispatch({type: 'setRedirect', userId: state.userId})}/>
    else if (state.type == 'redirect')
        return <Navigate to={`/dashboard/${state.userId}`} replace={true}/>
    else
        return <h1>Should not have arrived here!</h1>
}

const MAX_USER_ID = 9999

function UserInfo({onAuthDone}: { onAuthDone: (userId: number) => void }) {
    const setIsLoggedIn = useSetIsLoggedIn()
    const setError = useSetError()

    // This function should redirect user to ULisboa authentication page,
    // so he can obtain an access token

    /* TODO: improve this by using a reducer to have only one of the following states:
        - Not Created;
        - Creating;
        - Error;

      (...Just a suggestion...)
    */

    const [userId, setUserId] = useState<number | undefined>(undefined)

    async function createUser() {
        const userId = Math.floor(Math.random() * MAX_USER_ID)
        await service.createUserOrLogin(userId)
        .then(() => {
            // TODO: this is a solution just for now!!! Later, we won't be storing the user ID in cache
            localStorage['userId'] = userId.toString();
            setIsLoggedIn(true) // Sets - user logged in - in auth container
            setUserId(userId)            
        })
        .catch((error) => setError(error))
    }

    if (userId != undefined)
        return (
            <div>
                <h1>User created!</h1>
                <button onClick={() => onAuthDone(userId)}>Click here to advance</button>
            </div>
        )
    else
        return (
            <div>
                <h1>Create New User</h1>
                <button onClick={() => createUser()}>Click To Create user</button>
            </div>
        )
}

function ShareProgress({userId, onShareSelected}: { userId: number, onShareSelected: () => void }) {
    const setError = useSetError()

    async function selectShareProgressState(shareProgress: boolean) {
        await service.selectShareProgressState(userId, shareProgress)
            .then(() => onShareSelected())
            .catch((error) => setError(error))
    }

    return (
        <div>
            <h1>Do you want to share your progress?</h1>
            <br/>
            <button onClick={() => selectShareProgressState(true)}>Yes</button>
            <button onClick={() => selectShareProgressState(false)}>No</button>
        </div>
    );
}

function CreateBatch({userId, onLevelSelected, onStartQuizClick}: {
    userId: number,
    onLevelSelected: () => void,
    onStartQuizClick: () => void
}) {
    const setError = useSetError()

    async function createBatchLocal(level: LevelType) {
        await service.createBatch(userId, level) // returns if was successfull or not
            .then(() => onLevelSelected())
            .catch((error) => setError(error))
    }

    // For now, no confirm button...
    // For now, no quiz button...
    // TODO

    return (
        <SelectLevelComponent.SelectLevel onLevelClick={createBatchLocal} />
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
    "Question 10",
]

function Quiz({userId, onLevelSelected}: { userId: number, onLevelSelected: () => void }) {
    // This component will display a total of 10 question.
    // Then, it will calculate a score based on the answers
    // Not fully implemented yet because the requirements are not yet fully decided

    const [answers, setAnswers] = useState<boolean[]>(new Array(10).fill(undefined))
    const setError = useSetError()

    function onAnswerClick(questionNumber: number, answer: boolean) {
        const newAnswers: boolean[] = answers.slice()
        newAnswers[questionNumber] = answer
        setAnswers(newAnswers)
    }

    async function computeLevel() {
        // TODO: compute level based on answers
        const computedLevel: LevelType = LevelType.LEVEL_1

        // TODO: handle in case of error later
        await service.createBatch(userId, computedLevel) // returns if was successfull or not
        .then(() => onLevelSelected())
        .catch((error) => setError(error))
    }

    return (
        <div>
            <h1>10 questions to be displayed...</h1>
            <br/>
            {quizQuestions.map((question, questionNumber) => {
                return (
                    <div key={questionNumber}>
                        {question}{" "}
                        <button onClick={() => onAnswerClick(questionNumber, true)}>Sim!</button>
                        <button onClick={() => onAnswerClick(questionNumber, false)}>Não!</button>
                        <br/>
                    </div>
                )
            })}
            <br/>
            <button onClick={() => computeLevel()}>Confirmar respostas!</button>
        </div>
    );
}

function Avatar({userId, onComplete} : {userId: number, onComplete: () => void}) {
    const setError = useSetError()

    async function onAvatarClickHandler(avatarFilename: string) {
        await service.selectAvatar(userId, avatarFilename)
            .then(() => onComplete())
            .catch((error) => setError(error))
    }

    return <AvatarSelection onAvatarClick={onAvatarClickHandler}/>
}

export default LogIn;