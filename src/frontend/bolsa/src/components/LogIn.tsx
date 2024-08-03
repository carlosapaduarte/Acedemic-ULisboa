import React, {useEffect, useState, useReducer} from "react";
import {Navigate} from 'react-router-dom';

type State =
    {
        type: "userInfo",
    }
    |
    {
        type : "shareProgress",
    }
    |
    {
        type : "chooseLevel",
    }
    |
    {
        type : "quiz",
    }
    |
    {
        type: "redirect"
    }

type Action =
    {
        type : "setShareProgress",
    }
    |
    {
        type : "setChooseLevel",
    }
    |
    {
        type : "setQuiz",
    }
    |
    {
        type : "setRedirect",
    }

function reducer(state: State, action: Action): State {
    switch(action.type) {
        case "setShareProgress": {
            return { type: "shareProgress" }
        }
        case "setChooseLevel": {
            return { type: "chooseLevel" }
        }
        case "setQuiz": {
            return { type: "quiz" }
        }
        case "setRedirect": {
            return { type: "redirect" }
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
    const [state, dispatch] = React.useReducer(reducer, {type : 'userInfo'})
    const [levelChosen, setLevelChosen] = useState<Level | undefined>(undefined)
    const [shareProgress, setShareProgress] = useState<boolean | undefined>(undefined)

    const onAuthDoneHandler = () => {
        dispatch({type: 'setShareProgress'})
    };

    const handleOnShareClick = (accepted: boolean) => {
        setShareProgress(accepted)
        dispatch({type: 'setChooseLevel'})
    };

    const handleOnSelectedLevel = (level: Level) => {
        setLevelChosen(level)
        dispatch({type: 'setRedirect'})
    };

    const onStartQuizCLickHandler = () => { dispatch({type: 'setQuiz'}) }

    if (state.type === 'userInfo') {
        return <UserInfo onAuthDone={onAuthDoneHandler}/>
    } else if (state.type === "shareProgress") {
        return <ShareProgress onShareClick={(accepted: boolean) => handleOnShareClick(accepted)}/>
    } else if (state.type === "chooseLevel") {
        return <ChooseLevel onLevelClick={(level: Level) => handleOnSelectedLevel(level)} onStartQuizClick={onStartQuizCLickHandler}/>
    } else if (state.type === "quiz") {
        return <Quiz onLevelComputed={(level: Level) => handleOnSelectedLevel(level)} />
    } else 
        return <Navigate to={'/calendar'} replace={true}/>
}

function UserInfo({onAuthDone} : { onAuthDone: () => void }) {
    // This function should redirect user to ULisboa authentication page,
    // so he can obtain an access token

    return (
        <div>
            <h1>Redirect to Ulisboa Auth Service....</h1>
            <button onClick={() => onAuthDone()}>Click here to simulate auth</button>
        </div>
    )
}

function ShareProgress({onShareClick} : { onShareClick: (accepted: boolean) => void }) {
    return (
        <div>
            <h1>Do you want to share your progress?</h1>
            <br/>
            <button onClick={() => onShareClick(true)}>Yes</button>
            <button onClick={() => onShareClick(false)}>No</button>
        </div>
    );
}

enum Level {LEVEL_1, LEVEL_2, LEVEL_3}

function ChooseLevel({onLevelClick, onStartQuizClick} : { onLevelClick: (level: Level) => void, onStartQuizClick: () => void }) {
    return (
        <div>
            <h1>Choose Desired Level!</h1>
            <br/>
            <button onClick={() => onLevelClick(Level.LEVEL_1)}>Nível 1: Iniciante</button>
            <br/>
            <button onClick={() => onLevelClick(Level.LEVEL_2)}>Nível 2: Intermédio</button>
            <br/>
            <button onClick={() => onLevelClick(Level.LEVEL_3)}>Nível 3: Avançado… já se sente com um bom nível de eficácia e está…</button>
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

function Quiz({onLevelComputed} : { onLevelComputed: (level: Level) => void }) {
    // This component will soon display a total of 10 question.
    // Then, it will calculate a score based on the answers

    const [answers, setAnswers] = useState<boolean[]>(new Array(10).fill(undefined))

    function onAnswerClick(questionNumber: number, answer: boolean) {
        const newAnswers: boolean[] = answers.slice()
        newAnswers[questionNumber] = answer
        setAnswers(newAnswers)
    }

    function computeLevel() {
        // TODO: compute level based on answers

        const computedLevel: Level = Level.LEVEL_1
        onLevelComputed(computedLevel)
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