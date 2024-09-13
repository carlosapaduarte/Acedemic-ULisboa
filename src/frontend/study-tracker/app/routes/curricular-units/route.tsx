import { useEffect, useState } from "react";
import { useSetError } from "~/components/error/ErrorContainer";
import { CurricularUnit, Grade, service } from "~/service/service";
import { utils } from "~/utils";
import { CreateCurricularUnit } from "./CreateCU";
import { CreateGrade } from "./CreateGrade";
import Index from "../_index";

function useCurricularUnitView(initialCurricularUnit: CurricularUnit) {
    const setError = useSetError()
    const [curricularUnit, setCurricularUnit] = useState<CurricularUnit>(initialCurricularUnit)
    const [finalGrade, setFinalGrade] = useState<number | undefined>(undefined)

    function computeFinalGrade() {
        let finalGrade = 0
        curricularUnit.grades.forEach((grade: Grade) => finalGrade += grade.value * grade.weight)
        return finalGrade
    }

    useEffect(() => {
        setFinalGrade(computeFinalGrade())
    }, [curricularUnit])

    function refreshCurricularUnit() {
        const userId = utils.getUserId()
        service.getCurricularUnit(userId, initialCurricularUnit.name)
            .then((cu: CurricularUnit) => setCurricularUnit(cu))
            .catch((error) => setError(error))
    }

    return {curricularUnit, finalGrade, refreshCurricularUnit}
}

function CurricularUnitView({initialCurricularUnit} : {initialCurricularUnit: CurricularUnit}) {
    const {curricularUnit, finalGrade, refreshCurricularUnit} = useCurricularUnitView(initialCurricularUnit)
    return (
        <div>
            <h1>Name: {curricularUnit.name}</h1>
            <h1>Grades:</h1>
            {curricularUnit.grades.map((grade: Grade, index: number) => 
                <div key={index}>
                    <span>Value: {grade.value}</span>
                    <span>Weight: {grade.weight}</span>
                </div>
            )}
            <h1>Final Grade: {finalGrade}</h1>
            <CreateGrade curricularUnit={curricularUnit.name} onGradeCreated={refreshCurricularUnit} />
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
            {cuList.map((cu: CurricularUnit, index: number) =>
                <CurricularUnitView key={index} initialCurricularUnit={cu} />
            )}
        </div>
    )
}