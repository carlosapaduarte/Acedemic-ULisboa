import { useEffect, useState } from "react";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { CurricularUnit, Grade, service } from "~/service/service";
import { CreateCurricularUnit } from "./CreateCU";
import { CreateGrade } from "./CreateGrade";
import { RequireAuthn } from "~/components/auth/RequireAuthn";

function useCurricularUnitView(initialCurricularUnit: CurricularUnit) {
    const setGlobalError = useSetGlobalError();
    const [curricularUnit, setCurricularUnit] = useState<CurricularUnit>(initialCurricularUnit);
    const [finalGrade, setFinalGrade] = useState<number | undefined>(undefined);

    function computeFinalGrade() {
        let finalGrade = 0;
        curricularUnit.grades.forEach((grade: Grade) => finalGrade += grade.value * grade.weight);
        return finalGrade;
    }

    useEffect(() => {
        setFinalGrade(computeFinalGrade());
    }, [curricularUnit]);

    function refreshCurricularUnit() {
        service.getCurricularUnit(initialCurricularUnit.name)
            .then((cu: CurricularUnit) => setCurricularUnit(cu))
            .catch((error) => setGlobalError(error));
    }

    return { curricularUnit, finalGrade, refreshCurricularUnit };
}

function CurricularUnitView({ initialCurricularUnit }: { initialCurricularUnit: CurricularUnit }) {
    const { curricularUnit, finalGrade, refreshCurricularUnit } = useCurricularUnitView(initialCurricularUnit);
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
    );
}

function useCurricularUnitListView() {
    const setGlobalError = useSetGlobalError();
    const [cuList, setCuList] = useState<CurricularUnit[]>([]);

    function refreshCurricularUnits() {
        service.getCurricularUnits()
            .then((cus: CurricularUnit[]) => setCuList(cus))
            .catch((error) => setGlobalError(error));
    }

    useEffect(() => {
        refreshCurricularUnits();
    }, []);

    return { cuList, refreshCurricularUnits };
}

function CurricularUnitListView() {
    const { cuList, refreshCurricularUnits } = useCurricularUnitListView();

    return (
        <div>
            <CreateCurricularUnit onCuCreated={refreshCurricularUnits} />
            {cuList.map((cu: CurricularUnit, index: number) =>
                <CurricularUnitView key={index} initialCurricularUnit={cu} />
            )}
        </div>
    );
}

export default function CurricularUnitListViewAuthControlled() {
    return (
        <RequireAuthn>
            <CurricularUnitListView />
        </RequireAuthn>
    );
}