import { useEffect, useState } from "react";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { CurricularUnit, Grade, service } from "~/service/service";
import { CreateCurricularUnit } from "./CreateCU";
import { CreateGrade } from "./CreateGrade";
import { RequireAuthn } from "~/components/auth/RequireAuthn";
import styles from "./curricularUnitsPage.module.css";

function useCurricularUnitView(initialCurricularUnit: CurricularUnit) {
  const setGlobalError = useSetGlobalError();
  const [curricularUnit, setCurricularUnit] = useState<CurricularUnit>(
    initialCurricularUnit
  );
  const [finalGrade, setFinalGrade] = useState<number | undefined>(undefined);

  function computeFinalGrade() {
    let finalGrade = 0;
    let totalWeight = 0;
    curricularUnit.grades.forEach((grade: Grade) => {
      finalGrade += grade.value * (grade.weight / 100);
      totalWeight += grade.weight;
    });

    return Math.round(finalGrade * 100) / 100;
  }

  useEffect(() => {
    setFinalGrade(computeFinalGrade());
  }, [curricularUnit]);

  function refreshCurricularUnit() {
    service
      .getCurricularUnit(initialCurricularUnit.name)
      .then((cu: CurricularUnit) => setCurricularUnit(cu))
      .catch((error) => setGlobalError(error));
  }

  function handleDeleteGrade(gradeId: number) {
    if (!window.confirm("Tens a certeza que queres apagar esta nota?")) {
      return;
    }

    service
      .deleteGrade(curricularUnit.name, gradeId)
      .then(() => {
        refreshCurricularUnit();
      })
      .catch((error) => setGlobalError(error));
  }

  return {
    curricularUnit,
    finalGrade,
    refreshCurricularUnit,
    handleDeleteGrade,
  };
}

function CurricularUnitView({
  initialCurricularUnit,
}: {
  initialCurricularUnit: CurricularUnit;
}) {
  const {
    curricularUnit,
    finalGrade,
    refreshCurricularUnit,
    handleDeleteGrade,
  } = useCurricularUnitView(initialCurricularUnit);

  const totalWeight = curricularUnit.grades.reduce(
    (acc, grade) => acc + grade.weight,
    0
  );

  return (
    <div className={styles.cardContainer}>
      <h1 className={styles.cardTitle}>{curricularUnit.name}</h1>
      <h2 className={styles.subTitle}>Avaliações:</h2>

      <div className={styles.gradeList}>
        {curricularUnit.grades.map((grade: Grade) => {
          console.log("A verificar o objeto grade:", grade);
          return (
            <div key={grade.id} className={styles.gradeItem}>
              <div>
                {" "}
                <span>Valor: {grade.value}</span>
                <span>Peso: {grade.weight}%</span>
              </div>
              <button
                className={styles.deleteButton}
                onClick={() => handleDeleteGrade(grade.id)}
              >
                Apagar
              </button>
            </div>
          );
        })}
      </div>

      <h3
        className={styles.subTitle}
        style={{ textAlign: "right", marginTop: "1rem" }}
      >
        Peso Total Inserido: {totalWeight}% / 100%
      </h3>

      <h1 className={styles.finalGrade}>
        <span className={styles.finalGradeLabel}>Média Atual: </span>
        {finalGrade}
      </h1>

      <CreateGrade
        curricularUnit={curricularUnit.name}
        onGradeCreated={refreshCurricularUnit}
        totalWeight={totalWeight}
      />
    </div>
  );
}

function useCurricularUnitListView() {
  const setGlobalError = useSetGlobalError();
  const [cuList, setCuList] = useState<CurricularUnit[]>([]);

  function refreshCurricularUnits() {
    service
      .getCurricularUnits()
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
    <div className={styles.pageContainer}>
      <CreateCurricularUnit onCuCreated={refreshCurricularUnits} />
      {cuList.map((cu: CurricularUnit, index: number) => (
        <CurricularUnitView key={index} initialCurricularUnit={cu} />
      ))}
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
