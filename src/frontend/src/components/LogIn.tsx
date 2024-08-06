import React, {useReducer, useState} from "react";
import {Navigate} from 'react-router-dom';
import {service} from '../service/service';
import {useSetIsLoggedIn} from "./auth/Authn";

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
        return <ChooseLevel userId={state.userId}
                            onLevelSelected={() => dispatch({type: 'setRedirect', userId: state.userId})}
                            onStartQuizClick={() => onStartQuizCLickHandler(state.userId)}/>
    else if (state.type === "quiz")
        return <Quiz userId={state.userId}
                     onLevelSelected={() => dispatch({type: 'setRedirect', userId: state.userId})}/>
    else if (state.type == 'redirect')
        return <Navigate to={`/dashboard/${state.userId}`} replace={true}/>
    else
        return <h1>Should not have arrived here!</h1>
}

const MAX_USER_ID = 9999

function UserInfo({onAuthDone}: { onAuthDone: (userId: number) => void }) {
    const setIsLoggedIn = useSetIsLoggedIn()

    // This function should redirect user to ULisboa authentication page,
    // so he can obtain an access token

    /* TODO: improve this by using a reducer to have only one of the following states:
        - Not Created;
        - Creating;
        - Error;

      (...Just a suggestion...)
    */

    const [error, setError] = useState<boolean | undefined>(undefined)
    const [userId, setUserId] = useState<number | undefined>(undefined)

    async function createUser() {
        const userId = Math.floor(Math.random() * MAX_USER_ID)
        const created = await service.createUserOrLogin(userId)
        if (created) {

            // TODO: this is a solution just for now!!! Later, we won't be storing the user ID in cache
            localStorage['userId'] = userId.toString();
            setIsLoggedIn(true) // Sets - user logged in - in auth container
        }
        setUserId(userId)
        setError(!created)
    }

    if (userId != undefined)
        return (
            <div>
                <h1>User created!</h1>
                <button onClick={() => onAuthDone(userId)}>Click here to advance</button>
            </div>
        )

    if (error)
        return (
            <div>
                <h1>There was an error creating the user!</h1>
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

    async function selectShareProgressState(shareProgress: boolean) {
        const success = await service.selectShareProgressState(userId, shareProgress)
        if (success)
            onShareSelected()
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

enum Level {LEVEL_1, LEVEL_2, LEVEL_3}

async function chooseLevel(userId: number, level: Level): Promise<boolean> {
    let levelNumber = -1
    switch (level) {
        case Level.LEVEL_1 :
            levelNumber = 1
            break
        case Level.LEVEL_2 :
            levelNumber = 2
            break
        case Level.LEVEL_3 :
            levelNumber = 3
            break
    }
    return await service.chooseLevel(userId, levelNumber) // returns if was successfull or not
}

function ChooseLevel({userId, onLevelSelected, onStartQuizClick}: {
    userId: number,
    onLevelSelected: () => void,
    onStartQuizClick: () => void
}) {

    async function chooseLevelLocal(level: Level) {
        const success = await chooseLevel(userId, level)

        // TODO: handle in case of error later
        if (success)
            onLevelSelected()
    }

    return (
        <div>
            <h1>Choose Desired Level!</h1>
            <br/>
            <button onClick={() => chooseLevelLocal(Level.LEVEL_1)}>Nível 1: Iniciante</button>
            <br/>
            <button onClick={() => chooseLevelLocal(Level.LEVEL_2)}>Nível 2: Intermédio</button>
            <br/>
            <button onClick={() => chooseLevelLocal(Level.LEVEL_3)}>Nível 3: Avançado… já se sente com um bom nível de
                eficácia e está…
            </button>
            <br/>
            <button onClick={() => onStartQuizClick()}>Não sei o meu nível</button>
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
    "Question 10",
]

function Quiz({userId, onLevelSelected}: { userId: number, onLevelSelected: () => void }) {
    // This component will display a total of 10 question.
    // Then, it will calculate a score based on the answers
    // Not fully implemented yet because the requirements are not yet fully decided

    const [answers, setAnswers] = useState<boolean[]>(new Array(10).fill(undefined))

    function onAnswerClick(questionNumber: number, answer: boolean) {
        const newAnswers: boolean[] = answers.slice()
        newAnswers[questionNumber] = answer
        setAnswers(newAnswers)
    }

    async function computeLevel() {
        // TODO: compute level based on answers
        const computedLevel: Level = Level.LEVEL_1

        // TODO: handle in case of error later
        const success = await chooseLevel(userId, computedLevel)
        if (success)
            onLevelSelected()
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

export default LogIn;