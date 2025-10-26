import { useState } from "react";
import { service } from "~/service/service";
import styles from "./curricularUnitsPage.module.css";

function useCreateCurricularUnit(onCuCreated: () => void) {
  const [name, setName] = useState<string | undefined>(undefined);

  function createCurricularUnit(name: string) {
    service.createCurricularUnit(name).then(onCuCreated);
  }

  return { name, setName, createCurricularUnit };
}

export function CreateCurricularUnit({
  onCuCreated,
}: {
  onCuCreated: () => void;
}) {
  const { name, setName, createCurricularUnit } =
    useCreateCurricularUnit(onCuCreated);
  return (
    <div className={styles.cardContainer}>
      <h1 className={styles.cardTitle}>Criar Unidade Curricular</h1>
      <div className={styles.formGroup}>
        <label htmlFor="cuName" className={styles.label}>
          Nome
        </label>
        <input
          id="cuName"
          className={styles.input}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      {name ? (
        <button
          className={styles.button}
          onClick={() => createCurricularUnit(name)}
        >
          Confirmar
        </button>
      ) : (
        <></>
      )}
    </div>
  );
}
