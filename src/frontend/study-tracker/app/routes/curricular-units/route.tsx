import { useEffect, useState } from "react";
import { useSetError } from "~/components/error/ErrorContainer";
import { CurricularUnit, Grade, service } from "~/service/service";
import { utils } from "~/utils";
import { CreateCurricularUnit } from "./CreateCU";

function CurricularUnitView({curricularUnit} : {curricularUnit: CurricularUnit}) {
    return (
        <div>
            <h1>Name: {curricularUnit.name}</h1>
            <h1>Grades:</h1>
            {curricularUnit.grades.map((grade: Grade) => 
                <div>
                    <span>Value: {grade.value}</span>
                    <span>Weight: {grade.weight}</span>
                </div>
            )}
        </div>
    )
}

function useCurricularUnitListView() {
    const setError = useSetError()
    const [cuList, setCuList] = useState<CurricularUnit[]>([])

    function refreshCurricularUnits() {
        const userId = utils.getUserId()
        service.getCurricularUnits(userId)
            .then((cus: CurricularUnit[]) => setCuList(cus))
            .catch((error) => setError(error))
    }

    useEffect(() => {
        refreshCurricularUnits()
    }, [])

    return {cuList, refreshCurricularUnits}
}

export default function CurricularUnitListView() {
    const {cuList, refreshCurricularUnits} = useCurricularUnitListView()

    return (
        <div>
            <CreateCurricularUnit onCuCreated={refreshCurricularUnits} />
            {cuList.map((cu) =>
                <CurricularUnitView curricularUnit={cu} />        
            )}
        </div>
    )
}