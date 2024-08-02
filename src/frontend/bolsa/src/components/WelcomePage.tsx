import React, {useEffect, useState} from "react";
import {Navigate} from 'react-router-dom';

function WelcomePage() {
    const [redirect, setRedirect] = useState<string | undefined>(undefined)

    const handleOnChooseLevelClick = () => {
        setRedirect("/log-in")
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
                <button onClick={handleOnChooseLevelClick}>Choose Level!</button>
            </div>
        );
    }
}

export default WelcomePage;