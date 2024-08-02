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
        case "setRedirect": {
            return { type: "redirect" }
        }
    }
}

/**
 * This React component:
 * - shows a dialogue to simulate authentication;
 * - asks user if can share progress;
 * - lists possible levels;
 * - redirects for calendar component.
 */

function LogIn() {
    const [state, dispatch] = React.useReducer(reducer, {type : 'userInfo'})
    const [levelChosen, setLevelChosen] = useState<string | undefined>(undefined)
    const [shareProgress, setShareProgress] = useState<boolean | undefined>(undefined)

    const onAuthDoneHandler = () => {
        dispatch({type: 'setShareProgress'})
    };

    const handleOnShareClick = (accepted: boolean) => {
        setShareProgress(accepted)
        dispatch({type: 'setChooseLevel'})
    };

    const handleOnLevelClick = (level: string) => {
        setLevelChosen(level)
        dispatch({type: 'setRedirect'})
    };

    if (state.type === 'userInfo') {
        return <UserInfo onAuthDone={onAuthDoneHandler}/>
    } else if (state.type === "shareProgress") {
        return <ShareProgress onShareClick={(accepted: boolean) => handleOnShareClick(accepted)}/>
    } else if (state.type === "chooseLevel") {
        return <ChooseLevel onLevelClick={(level: string) => handleOnLevelClick(level)}/>
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

function ChooseLevel({onLevelClick} : { onLevelClick: (level: string) => void }) {
    return (
        <div>
            <h1>Choose Desired Level!</h1>
            <br/>
            <button onClick={() => onLevelClick('level 1')}>Nível 1: Iniciante</button>
            <br/>
            <button onClick={() => onLevelClick('level 2')}>Nível 2: Intermédio</button>
            <br/>
            <button onClick={() => onLevelClick('level 3')}>Nível 3: Avançado… já se sente com um bom nível de eficácia e está…</button>
        </div>
        // TODO: show option for quiz
    );
}

export default LogIn;