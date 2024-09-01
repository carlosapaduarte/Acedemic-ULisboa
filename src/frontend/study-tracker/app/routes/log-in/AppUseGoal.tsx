import { useState } from "react";
import { useSetError } from "~/components/error/ErrorContainer";
import { service } from "~/service/service";

const questions = [
    "Melhorar as minhas notas/classificações",
    "Acompanhar o meu progresso",
    "Preparar-me para exames específicos",
    "Personalizar o meu plano de estudo",
    "Cumprir prazos e entregas",
    "Gerir os estudos com as outras áreas da minha vida"
]

export default function AppUseGoals({onProceed} : {onProceed: () => void}) {
    const [selectedOptions, setSelectedOptions] = useState<Set<number>>(new Set([]))
    const setError = useSetError();

    function onInputValueChange(index: number) {
        const cur: Set<number> = new Set([...selectedOptions])
        if (cur.has(index))
            cur.delete(index)
        else
            cur.add(index)
        setSelectedOptions(cur)
    }

    function submitAppUseGoals() {
        const userIdStr = localStorage["userId"]
        const userId = Number(userIdStr)
        service.updateAppUseGoals(userId, selectedOptions)
            .then(() => onProceed())
            .catch((error) => setError(error));
    }
    
    return (
        <div className="flex flex-col">
            <h1>Objetivo de Utilização</h1>
            <div className="flex flex-col">
                {questions.map((question: string, index: number) => 
                    <div key={index}>
                        <input type="checkbox" onChange={() => onInputValueChange(index)}/>
                        <label>{question}</label>
                    </div>    
                )}
                <button onClick={submitAppUseGoals}>
                    Submit Selection
                </button>
            </div>
        </div>
    )
}