import React, {useEffect, useState} from "react";
import {Navigate} from 'react-router-dom';
import { useIsLoggedIn } from "./auth/Authn";

function WelcomePage() {
    const [redirect, setRedirect] = useState<string | undefined>(undefined)
    const isLoggedIn = useIsLoggedIn()

    const handleOnChooseLevelClick = () => {
        if (!isLoggedIn)
            setRedirect("/log-in")
        else {
            const cachedUserId = localStorage['userId'] // TODO: use cache just for now
            setRedirect(`/dashboard/${cachedUserId}`)
        }
    };
    
    if (redirect) {
        return <Navigate to={redirect} replace={true}/>
    } else {
        return (
            <div>
                <h1>Welcome Page</h1>
                <p>
                    Imagina o que seria transformares o teu desempenho académico em três semanas... Parece-te impossível? Estudos mostram que são apenas necessários 21 dias para mudar ou implementar um hábito. O “21 Days Challenge da Autoeficácia” aproveita essa ciência para te ajudar a criar hábitos de estudo mais eficazes e, com isso, mudar a tua trajetória académica. Estás pronto para aproveitar ao máximo tua experiência universitária? Começa hoje e vê a diferença que 21 dias podem fazer!
                </p>
                <button onClick={handleOnChooseLevelClick}>Proceed</button>
            </div>
        );
    }
}

export default WelcomePage;