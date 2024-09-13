import { useState } from "react"
import { service } from "~/service/service"
import { utils } from "~/utils"

function useCreateGrade(curricularUnit: string, onCuCreated: () => void) {
    const [value, setValue] = useState<number | undefined>(undefined)
    const [weight, setWeight] = useState<number | undefined>(undefined)

    function createGrade(value: number, weight: number) {
        const userId = utils.getUserId()
        service.createGrade(userId, curricularUnit, value, weight)
            .then(onCuCreated)
    }

    return {value, setValue, weight, setWeight, createGrade}
}

export function CreateGrade({curricularUnit, onGradeCreated} : {curricularUnit: string, onGradeCreated: () => void}) {
    const {value, setValue, weight, setWeight, createGrade} = useCreateGrade(curricularUnit, onGradeCreated)
    
    return (
        <div>
            <h1>Create Grade</h1>
            <label>Value</label>
            <br/>
            <input type="number" onChange={(e) => setValue(Number(e.target.value))}/>
            <br/>
            <label>Weight</label>
            <br/>
            <input type="number" onChange={(e) => setWeight(Number(e.target.value))}/>
            
            {value && weight ?
                <button onClick={() => createGrade(value, weight)}>
                    Confirm
                </button>
                :
                <></>
            }
        </div>
    )
}