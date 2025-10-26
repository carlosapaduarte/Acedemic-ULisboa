import { useState } from "react";
import { service } from "~/service/service";
import styles from "./curricularUnitsPage.module.css";

function useCreateGrade(curricularUnit: string, onCuCreated: () => void) {
  const [value, setValue] = useState<number | undefined>(undefined);
  const [weight, setWeight] = useState<number | undefined>(undefined);

  function createGrade(value: number, weight: number) {
    service.createGrade(curricularUnit, value, weight).then(onCuCreated);
  }

  return { value, setValue, weight, setWeight, createGrade };
}

export function CreateGrade({
  curricularUnit,
  onGradeCreated,
  totalWeight,
}: {
  curricularUnit: string;
  onGradeCreated: () => void;
  totalWeight: number;
}) {
  const { value, setValue, weight, setWeight, createGrade } = useCreateGrade(
    curricularUnit,
    onGradeCreated
  );

  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  function handleValueChange(newValue: number) {
    if (newValue < 0 || newValue > 20) {
      setErrorMessage("A nota deve estar entre 0 e 20.");
    } else {
      setErrorMessage(undefined);
    }
    setValue(newValue);
  }

  function handleWeightChange(newWeight: number) {
    if (totalWeight + newWeight > 100) {
      setErrorMessage(
        `O peso total não pode exceder 100%. (Atual: ${totalWeight}% + ${newWeight}% = ${
          totalWeight + newWeight
        }%)`
      );
    } else {
      setErrorMessage(undefined);
    }
    setWeight(newWeight);
  }

  const isInvalid =
    value === undefined ||
    weight === undefined ||
    value < 0 ||
    value > 20 ||
    totalWeight + weight > 100;

  return (
    <div>
      <h2 className={styles.subTitle}>Adicionar Avaliação</h2>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="gradeValue" className={styles.label}>
            Valor (Nota 0-20)
          </label>
          <input
            id="gradeValue"
            type="number"
            className={styles.input}
            onChange={(e) => setValue(Number(e.target.value))}
            min="0"
            max="20"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="gradeWeight" className={styles.label}>
            Peso (em %, ex: 50)
          </label>
          <input
            id="gradeWeight"
            type="number"
            className={styles.input}
            value={weight ?? ""}
            onChange={(e) => handleWeightChange(Number(e.target.value))}
            min="0"
            max="100"
          />
        </div>
      </div>

      {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

      {value !== undefined && weight !== undefined ? (
        <button
          className={styles.button}
          onClick={() => createGrade(value!, weight!)}
          disabled={isInvalid}
        >
          Confirmar Avaliação
        </button>
      ) : (
        <></>
      )}
    </div>
  );
}
