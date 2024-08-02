import React, {useEffect, useState} from "react";
import {Navigate} from 'react-router-dom';

// !!! This component is not being used for the moment. It was replace by "LogIn.tsx"
// !!! Please ignore this component!

function ChooseLevel() {
    const [redirect, setRedirect] = useState<string | undefined>(undefined)
    const [levelChosen, setLevelChosen] = useState<string | undefined>(undefined)

    const handleOnLevelClick = (level: string) => {
        setLevelChosen(level)
    };

    const onConfirmClick = () => {
        if (levelChosen != undefined)
            setRedirect('/calendar')
    };

    if (redirect != undefined)
        return <Navigate to={redirect} replace={true}/>
    else
        return (
            <div>
                <h1>Choose Desired Level!</h1>
                <br/>
                <button onClick={() => handleOnLevelClick('level 1')}>Level 1</button>
                <button onClick={() => handleOnLevelClick('level 2')}>Level 2</button>
                <button onClick={() => handleOnLevelClick('level 3')}>Level 3</button>
                <button onClick={onConfirmClick}>Confirm</button>
            </div>
        );
}

export default ChooseLevel;