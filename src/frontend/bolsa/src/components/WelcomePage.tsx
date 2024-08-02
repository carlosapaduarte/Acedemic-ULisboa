import React, {useEffect, useState} from "react";
import {Navigate} from 'react-router-dom';

function WelcomePage() {
    const [redirect, setRedirect] = useState<string | undefined>(undefined)

    const handleOnChooseLevelClick = () => {
        setRedirect("/choose-level")
    };
    
    if (redirect) {
        return <Navigate to={redirect} replace={true}/>
    } else {
        return (
            <div>
                <h1>Welcome Page</h1>
                <button onClick={handleOnChooseLevelClick}>Choose Level!</button>
            </div>
        );
    }
}

export default WelcomePage;