import { useState } from "react";
import { service } from "~/service/service";

function useCreateCurricularUnit(onCuCreated: () => void) {
    const [name, setName] = useState<string | undefined>(undefined);

    function createCurricularUnit(name: string) {
        service.createCurricularUnit(name)
            .then(onCuCreated);
    }

    return { name, setName, createCurricularUnit };
}

export function CreateCurricularUnit({ onCuCreated }: { onCuCreated: () => void }) {
    const { name, setName, createCurricularUnit } = useCreateCurricularUnit(onCuCreated);
    return (
        <div>
            <h1>Create Curricular Unit</h1>
            <label>Name</label>
            <br />
            <input onChange={(e) => setName(e.target.value)} />
            {name ?
                <button onClick={() => createCurricularUnit(name)}>
                    Confirm
                </button>
                :
                <></>
            }
        </div>
    );
}