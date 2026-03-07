import { useState } from "react";
import { useTranslation } from "react-i18next";
import { service } from "~/service/service";
import styles from "./curricularUnitsPage.module.css";

export function useCreateGrade(
  curricularUnit: string,
  onCuCreated: () => void,
) {
  const [name, setName] = useState<string>("");
  const [value, setValue] = useState<number | undefined>(undefined);
  const [weight, setWeight] = useState<number | undefined>(undefined);

  function createGrade(
    gradeName: string,
    gradeValue: number,
    gradeWeight: number,
  ) {
    service
      .createGrade(curricularUnit, gradeName, gradeValue, gradeWeight)
      .then(() => {
        onCuCreated();

        setName("");
        setValue(undefined);
        setWeight(undefined);
      })
      .catch((err) => console.error("Erro ao criar avaliação", err));
  }

  return { name, setName, value, setValue, weight, setWeight, createGrade };
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
  const { t } = useTranslation(["curricular_units"]);

  // Usamos o hook que tem o nome agora
  const { name, setName, value, setValue, weight, setWeight, createGrade } =
    useCreateGrade(curricularUnit, onGradeCreated);

  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  // NOTA: Removi a validação de nota (0-20) porque ao CRIAR uma componente,
  // normalmente só precisas de definir o nome e o peso. A nota podes preencher no simulador.
  // Se quiseres pedir a nota logo na criação, os inputs continuam cá em baixo.

  function handleWeightChange(newWeight: number) {
    if (totalWeight + newWeight > 100) {
      setErrorMessage(
        t("curricular_units:error_excessive_weight", {
          max: 100 - totalWeight,
        }),
      );
    } else {
      setErrorMessage(undefined);
    }
    setWeight(newWeight);
  }

  const isInvalid =
    weight === undefined || weight <= 0 || totalWeight + weight > 100;

  function handleSubmit() {
    // O nome final: Se o utilizador não escreveu nada, chamamos de "Avaliação"
    const finalName =
      name.trim() === "" ? t("curricular_units:default_evaluation_name") : name;

    // A nota (value) por defeito é 0 se o user não preencher
    const finalValue = value === undefined ? 0 : value;

    createGrade(finalName, finalValue, weight!);
  }

  return (
    <div className={styles.addGradeSection}>
      <h4 className={styles.subTitle}>
        {t("curricular_units:add_component_title", "Adicionar Avaliação")}
      </h4>
      <div className={styles.formGrid}>
        {/* INPUT DO NOME DA AVALIAÇÃO */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            {t("curricular_units:label_component", "Nome")}
          </label>
          <input
            type="text"
            className={styles.input}
            placeholder={t(
              "curricular_units:placeholder_component",
              "Ex: Projeto de Grupo",
            )}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* INPUT DO PESO */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            {t("curricular_units:label_weight", "Peso (%)")}
          </label>
          <input
            type="number"
            className={styles.input}
            placeholder="Ex: 50"
            value={weight ?? ""}
            onChange={(e) => handleWeightChange(Number(e.target.value))}
            min="1"
            max="100"
          />
        </div>

        {/* Opcional: Input de nota inicial se quiseres. (Eu prefiro deixar o user editar isto depois na lista) */}
      </div>

      {errorMessage && (
        <p
          style={{
            color: "#FFCCBC",
            fontSize: "0.85rem",
            marginTop: "-10px",
            marginBottom: "10px",
          }}
        >
          {errorMessage}
        </p>
      )}

      <button
        className={styles.addButton}
        onClick={handleSubmit}
        disabled={isInvalid}
      >
        {t("curricular_units:btn_add", "Adicionar")}
      </button>
    </div>
  );
}
