import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { CurricularUnit, service } from "~/service/service";
import { RequireAuthn } from "~/components/auth/RequireAuthn";
import styles from "./curricularUnitsPage.module.css";
import { CreateGrade } from "./CreateGrade";
import {
  FaPlus,
  FaLock,
  FaUnlock,
  FaTrash,
  FaBullseye,
  FaPen,
  FaCheck,
  FaXmark,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa6";

// ==========================================
// 2. CRIAR UC
// ==========================================
function CreateCurricularUnitForm({
  onCuCreated,
  onClose,
  isModal = false,
}: {
  onCuCreated: () => void;
  onClose?: () => void;
  isModal?: boolean;
}) {
  const { t } = useTranslation(["curricular_units"]);
  const [name, setName] = useState("");
  const [ects, setEcts] = useState("6");
  const [minGrade, setMinGrade] = useState("9.5");
  const [error, setError] = useState<string>();

  function handleSubmit() {
    if (!name || !ects) return;
    const numEcts = parseFloat(ects);
    const numMinGrade = parseFloat(minGrade);
    if (isNaN(numEcts) || numEcts <= 0 || isNaN(numMinGrade)) return;

    service
      .createCurricularUnit(name, numEcts, numMinGrade)
      .then(() =>
        service
          .createTag({
            name_pt: name,
            name_en: name,
            color: "#5DADE2",
            is_uc: true,
          } as any)
          .catch(() => {}),
      )
      .then(() => {
        setError(undefined);
        onCuCreated();
        if (onClose) onClose();
      })
      .catch((err) => {
        setError(
          t(
            "curricular_units:error_duplicate_uc",
            "Erro ao criar UC. Verifique se o nome já existe.",
          ),
        );
        console.error(err);
      });
  }

  const inputClass = isModal ? styles.modalInput : styles.modalInput;
  const labelClass = isModal ? styles.modalLabel : styles.modalLabel;

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          gap: "1rem",
          flexDirection: isModal ? "row" : "column",
          alignItems: "flex-end",
        }}
      >
        <div style={{ flex: 2, width: "100%" }}>
          <label className={labelClass}>
            {t("curricular_units:label_uc_name")}
          </label>
          <input
            className={inputClass}
            onChange={(e) => {
              setName(e.target.value);
              setError(undefined);
            }}
            placeholder={t("curricular_units:placeholder_uc_name")}
            value={name}
            autoFocus
            style={{ margin: 0 }}
          />
        </div>
        <div style={{ flex: 1, width: "100%" }}>
          <label className={labelClass}>ECTS</label>
          <input
            type="number"
            className={inputClass}
            onChange={(e) => setEcts(e.target.value)}
            placeholder="6"
            value={ects}
            style={{ margin: 0 }}
          />
        </div>
        <div style={{ flex: 1, width: "100%" }}>
          <label className={labelClass}>
            {t("curricular_units:label_min_grade", "Nota Min.")}
          </label>
          <input
            type="number"
            className={inputClass}
            onChange={(e) => {
              let v = e.target.value;
              if (v !== "" && parseFloat(v) > 20) v = "20";
              setMinGrade(v);
            }}
            placeholder="9.5"
            value={minGrade}
            min="0"
            max="20"
            step="0.1"
            style={{ margin: 0 }}
          />
        </div>
      </div>
      {error && (
        <p
          style={{
            color: "#EF5350",
            fontSize: "0.85rem",
            marginTop: "-10px",
            marginBottom: "15px",
            fontWeight: "bold",
          }}
        >
          {error}
        </p>
      )}
      {isModal ? (
        <div className={styles.modalActions}>
          <button className={styles.cancelButton} onClick={onClose}>
            {t("curricular_units:btn_cancel")}
          </button>
          <button className={styles.confirmButton} onClick={handleSubmit}>
            {t("curricular_units:btn_create")}
          </button>
        </div>
      ) : (
        <button
          className={styles.confirmButton}
          style={{ width: "100%" }}
          onClick={handleSubmit}
        >
          {t("curricular_units:btn_create_first")}
        </button>
      )}
    </div>
  );
}

// ==========================================
// COMPONENTE PARA CADA NOTA (Auto-Save e nota max 20)
// ==========================================
function GradeRow({
  g,
  cuName,
  index,
  isLocked,
  onToggleLock,
  onDelete,
}: {
  g: any;
  cuName: string;
  index: number;
  isLocked: boolean;
  onToggleLock: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const { t } = useTranslation(["curricular_units"]);
  const compName =
    g.name || `${t("curricular_units:default_evaluation_name")} ${index + 1}`;

  const [localValue, setLocalValue] = useState<string>(
    g.value === 0 ? "" : g.value.toString(),
  );

  useEffect(() => {
    const originalValue = g.value === 0 ? "" : g.value.toString();

    if (localValue !== originalValue) {
      const timeoutId = setTimeout(async () => {
        const valToSave = parseFloat(localValue) || 0;
        try {
          await service.updateGradeValue(cuName, g.id, valToSave);
          console.log(`Nota ${compName} gravada na BD: ${valToSave}`);
        } catch (e) {
          console.error(e);
        }
      }, 800);

      return () => clearTimeout(timeoutId);
    }
  }, [localValue, g.value, cuName, g.id, compName]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let strVal = e.target.value;
    if (strVal !== "") {
      let num = parseFloat(strVal);
      if (num > 20) strVal = "20";
      if (num < 0) strVal = "0";
    }
    setLocalValue(strVal);
  };

  return (
    <div
      className={styles.gradeItem}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderLeft: isLocked ? "4px solid #66BB6A" : "4px solid #E8E2D9",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
          {compName} <span className={styles.gradeWeight}>({g.weight}%)</span>
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <input
            type="number"
            disabled={isLocked}
            value={localValue}
            placeholder="0.0"
            min="0"
            max="20"
            step="0.1"
            onChange={handleValueChange}
            style={{
              background: "var(--color-1)",
              color: "var(--text-color-1)",
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: "4px",
              padding: "4px 8px",
              width: "70px",
              outline: "none",
              cursor: isLocked ? "not-allowed" : "text",
            }}
          />
          <span style={{ fontSize: "0.8rem", color: "var(--text-color-2)" }}>
            val.
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        <button
          onClick={() => onToggleLock(g.id)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1.2rem",
            color: isLocked ? "#66BB6A" : "rgba(255,255,255,0.4)",
          }}
        >
          {isLocked ? <FaLock /> : <FaUnlock />}
        </button>
        <button
          onClick={() => onDelete(g.id)}
          disabled={isLocked}
          style={{
            background: "none",
            border: "none",
            color: isLocked ? "rgba(255,255,255,0.1)" : "#FF5252",
            fontSize: "1.1rem",
            cursor: isLocked ? "not-allowed" : "pointer",
          }}
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 3. CARTÃO DE UC
// ==========================================
function CurricularUnitCard({
  cu,
  onRefresh,
}: {
  cu: CurricularUnit;
  onRefresh: () => void;
}) {
  const { t } = useTranslation(["curricular_units"]);
  const [lockedGrades, setLockedGrades] = useState<number[]>([]);
  const [simulatedValues, setSimulatedValues] = useState<
    Record<number, number>
  >({});
  const [isScenariosOpen, setIsScenariosOpen] = useState(true);

  const [isEditingUC, setIsEditingUC] = useState(false);
  const [editName, setEditName] = useState(cu.name);
  const [editEcts, setEditEcts] = useState((cu.ects ?? 6).toString());
  const [editMinGrade, setEditMinGrade] = useState(
    (cu.min_grade ?? 9.5).toString(),
  );

  const [localTarget, setLocalTarget] = useState(
    cu.target_grade ? cu.target_grade.toString() : "",
  );

  useEffect(() => {
    const originalTarget = cu.target_grade ? cu.target_grade.toString() : "";

    if (localTarget !== originalTarget) {
      const timeoutId = setTimeout(() => {
        handleSaveTarget();
      }, 800);

      return () => clearTimeout(timeoutId);
    }
  }, [localTarget]);

  const minGrade = cu.min_grade ?? 9.5;
  const targetGrade = parseFloat(localTarget);
  const hasTarget = !isNaN(targetGrade) && localTarget !== "";

  const handleStartEdit = () => {
    setEditName(cu.name);
    setEditEcts((cu.ects ?? 6).toString());
    setEditMinGrade((cu.min_grade ?? 9.5).toString());
    setIsEditingUC(true);
  };

  const handleSaveTarget = async () => {
    const tGrade = localTarget === "" ? null : parseFloat(localTarget);
    if (localTarget !== "" && isNaN(tGrade as number)) return;

    console.log("🚀 A ATUALIZAR META DA UC:", {
      oldName: cu.name,
      newName: cu.name,
      ects: cu.ects ?? 6,
      min: minGrade,
      target: tGrade,
    });

    try {
      await service.updateCurricularUnit(
        cu.name,
        cu.name,
        cu.ects ?? 6,
        minGrade,
        tGrade,
      );
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveEditUC = async () => {
    if (!editName || !editEcts || !editMinGrade) return;

    console.log("✏️ A EDITAR DADOS DA UC:", {
      oldName: cu.name,
      newName: editName,
      ects: parseFloat(editEcts),
      min: parseFloat(editMinGrade),
      target: cu.target_grade ?? null,
    });

    try {
      await service.updateCurricularUnit(
        cu.name,
        editName,
        parseFloat(editEcts),
        parseFloat(editMinGrade),
        cu.target_grade ?? null,
      );
      setIsEditingUC(false);
      onRefresh();
    } catch (e) {
      console.error(e);
      setIsEditingUC(false);
    }
  };

  const handleDeleteUC = async () => {
    if (confirm(t("curricular_units:confirm_delete_uc"))) {
      console.log("🗑️ A TENTAR APAGAR A UC:", cu.name);
      try {
        await service.deleteCurricularUnit(cu.name);
        onRefresh();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const displayEcts = cu.ects ?? 6;
  const totalWeight = cu.grades.reduce((acc, g) => acc + g.weight, 0);
  const remainingWeight = 100 - totalWeight;
  const isTotalWeight100 = totalWeight >= 99.9;

  const componentsAtZero = cu.grades.filter(
    (g) => (simulatedValues[g.id] ?? g.value) === 0,
  );
  const canShowScenarios = isTotalWeight100 && componentsAtZero.length === 1;
  const targetComponent = canShowScenarios ? componentsAtZero[0] : null;

  const lockedPoints = cu.grades
    .filter((g) => lockedGrades.includes(g.id))
    .reduce(
      (acc, g) => acc + (simulatedValues[g.id] ?? g.value) * (g.weight / 100),
      0,
    );
  const unlockedPoints = cu.grades
    .filter((g) => !lockedGrades.includes(g.id))
    .reduce(
      (acc, g) => acc + (simulatedValues[g.id] ?? g.value) * (g.weight / 100),
      0,
    );
  const currentPoints = lockedPoints + unlockedPoints;
  const effectiveTarget = hasTarget ? targetGrade : minGrade;

  const toggleLock = (id: number) =>
    setLockedGrades((prev) =>
      prev.includes(id) ? prev.filter((gId) => gId !== id) : [...prev, id],
    );
  const handleSimulate = (id: number, newValue: number) =>
    setSimulatedValues((prev) => ({ ...prev, [id]: newValue }));
  function handleDeleteGrade(id: number) {
    service.deleteGrade(cu.name, id).then(onRefresh).catch(console.error);
  }

  // 🛡️ INSIGHTS COM FALLBACKS (Para nunca falhar o texto na demo)
  let neededMessage = "";

  if (hasTarget && targetGrade < minGrade) {
    // ⚠️ AVISO DE META INFERIOR À NOTA MÍNIMA
    neededMessage = `💡 ${t(
      "curricular_units:insight_target_below_min",
      "A tua meta ({{target}}) é inferior à nota mínima ({{min}}). Foca-te em atingir a mínima!",
      { target: targetGrade, min: minGrade },
    )}`;
  } else if (canShowScenarios && targetComponent && hasTarget) {
    const neededRelative =
      (targetGrade - currentPoints) / (targetComponent.weight / 100);
    if (neededRelative > 20)
      neededMessage = `⚠️ ${t(
        "curricular_units:insight_impossible",
        "Com os pesos atuais, já não é possível atingir a tua meta.",
      )}`;
    else if (neededRelative <= 0)
      neededMessage = `🎉 ${t(
        "curricular_units:insight_guaranteed",
        "A tua meta já está garantida!",
      )}`;
    else
      neededMessage = `🎯 ${t(
        "curricular_units:insight_needed_single",
        "Precisas de tirar {{needed}} para atingir a tua meta de {{target}}.",
        { needed: neededRelative.toFixed(2), target: targetGrade },
      )}`;
  } else {
    if (currentPoints >= effectiveTarget) {
      neededMessage = `🎉 ${t(
        "curricular_units:insight_achieved",
        "Atingiste a tua meta de {{target}}!",
        { target: effectiveTarget },
      )}`;
    } else if (currentPoints + 20 * (remainingWeight / 100) < effectiveTarget) {
      neededMessage = `⚠️ ${t(
        "curricular_units:insight_impossible_generic",
        "Atenção: Já não é possível atingir {{target}} com os pesos atuais.",
        { target: effectiveTarget },
      )}`;
    } else {
      neededMessage = t(
        "curricular_units:insight_missing_absolute",
        "Faltam {{missing}} valores absolutos para a meta de {{target}}.",
        {
          missing: (effectiveTarget - currentPoints).toFixed(2),
          target: effectiveTarget,
        },
      );
    }
  }

  const possibleFinalGrades = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const simulationScenarios =
    canShowScenarios && targetComponent
      ? possibleFinalGrades
          .map((finalGrade) => {
            const needed =
              (finalGrade - currentPoints) / (targetComponent.weight / 100);
            return { finalGrade, needed };
          })
          .filter((s) => s.needed >= 0 && s.needed <= 20)
      : [];

  const integerOptions = Array.from({ length: 21 }, (_, i) => i);
  const decimalOptions = [
    0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90,
    95,
  ];
  const chipStyle = {
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "bold",
    display: "inline-block",
    margin: 0,
  };

  return (
    <div className={`${styles.cardContainer} tutorial-target-uc-card`}>
      <div className={styles.cardContainer}>
        {isEditingUC ? (
          <div
            style={{
              display: "flex",
              gap: "10px",
              width: "100%",
              alignItems: "center",
              background: "rgba(0,0,0,0.1)",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "15px",
              flexWrap: "wrap",
            }}
          >
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className={styles.input}
              style={{ flex: 1, margin: 0, padding: "8px" }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <input
                type="number"
                value={editEcts}
                onChange={(e) => setEditEcts(e.target.value)}
                className={styles.input}
                style={{ width: "60px", margin: 0, padding: "8px" }}
              />
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-color-2)",
                  fontWeight: "bold",
                }}
              >
                ECTS
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <input
                type="number"
                value={editMinGrade}
                onChange={(e) => {
                  let v = e.target.value;
                  if (v !== "" && parseFloat(v) > 20) v = "20";
                  setEditMinGrade(v);
                }}
                className={styles.input}
                style={{ width: "60px", margin: 0, padding: "8px" }}
                min="0"
                max="20"
                step="0.1"
              />
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-color-2)",
                  fontWeight: "bold",
                }}
              >
                Min
              </span>
            </div>
            <button
              onClick={handleSaveEditUC}
              style={{
                background: "#66BB6A",
                border: "none",
                color: "white",
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              <FaCheck />
            </button>
            <button
              onClick={() => setIsEditingUC(false)}
              style={{
                background: "#EF5350",
                border: "none",
                color: "white",
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              <FaXmark />
            </button>
          </div>
        ) : (
          <div
            className={styles.cardHeader}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>
                {cu.name}
              </h3>
              <span className={styles.ectsBadge} style={chipStyle}>
                {displayEcts} ECTS
              </span>
              <span
                style={{
                  ...chipStyle,
                  background: "rgba(239, 83, 80, 0.1)",
                  color: "#EF5350",
                }}
              >
                Min: {minGrade}
              </span>
            </div>
            <div style={{ display: "flex", gap: "15px", paddingTop: "5px" }}>
              <button
                onClick={handleStartEdit}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-color-2)",
                  opacity: 0.5,
                  cursor: "pointer",
                }}
                title="Editar UC"
              >
                <FaPen size={14} />
              </button>
              <button
                onClick={handleDeleteUC}
                style={{
                  background: "none",
                  border: "none",
                  color: "#EF5350",
                  opacity: 0.7,
                  cursor: "pointer",
                }}
                title={t("curricular_units:btn_delete_uc")}
              >
                <FaTrash size={14} />
              </button>
            </div>
          </div>
        )}

        <div className={styles.simulatorContainer}>
          <div
            className={styles.progressLabels}
            style={{ alignItems: "center" }}
          >
            <span>
              {t("curricular_units:label_current")}{" "}
              <strong style={{ fontSize: "1.2rem" }}>
                {currentPoints.toFixed(2)}
              </strong>{" "}
              val.
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <FaBullseye color="#FFCA28" />{" "}
              {t("curricular_units:label_target")}
              <input
                type="number"
                placeholder="--"
                value={localTarget}
                onChange={(e) => {
                  let v = e.target.value;
                  if (v !== "" && parseFloat(v) > 20) v = "20";
                  setLocalTarget(v);
                }}
                onBlur={handleSaveTarget}
                min="0"
                max="20"
                step="0.1"
                style={{
                  width: "70px",
                  background: "rgba(0,0,0,0.2)",
                  border: "none",
                  color: "white",
                  borderRadius: "4px",
                  padding: "2px 5px",
                  fontWeight: "bold",
                }}
              />
            </span>
          </div>

          <div
            style={{
              position: "relative",
              marginTop: "30px",
              marginBottom: "15px",
            }}
          >
            <div
              style={{
                left: `${(minGrade / 20) * 100}%`,
                position: "absolute",
                top: "-20px",
                zIndex: 98,
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "0.65rem",
                  color: "#EF5350",
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                  marginBottom: "2px",
                }}
              >
                {t("curricular_units:label_min_grade")}
              </span>
              <div
                style={{
                  width: "2px",
                  height: "28px",
                  backgroundColor: "#EF5350",
                }}
              ></div>
            </div>

            {hasTarget && (
              <div
                style={{
                  left: `${(targetGrade / 20) * 100}%`,
                  position: "absolute",
                  top: "-20px",
                  zIndex: 99,
                  transform: "translateX(-50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "0.65rem",
                    color: "#FFCA28",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                    marginBottom: "2px",
                  }}
                >
                  {t("curricular_units:label_target_short", "Meta")}
                </span>
                <div
                  style={{
                    width: "2px",
                    height: "28px",
                    backgroundColor: "#FFCA28",
                  }}
                ></div>
              </div>
            )}

            <div
              className={styles.progressBarBg}
              style={{
                display: "flex",
                overflow: "hidden",
                position: "relative",
                height: "12px",
              }}
            >
              <div
                style={{
                  width: `${(lockedPoints / 20) * 100}%`,
                  backgroundColor: "#66BB6A",
                  height: "100%",
                  transition: "width 0.3s ease",
                  borderTopLeftRadius: "6px",
                  borderBottomLeftRadius: "6px",
                }}
              ></div>
              <div
                style={{
                  width: `${(unlockedPoints / 20) * 100}%`,
                  backgroundColor: "#E8E2D9",
                  height: "100%",
                  transition: "width 0.3s ease",
                  borderTopRightRadius: "6px",
                  borderBottomRightRadius: "6px",
                }}
              ></div>
            </div>
          </div>

          <p
            className={styles.simulationText}
            style={{
              fontWeight: 600,
              color: "var(--text-color-2)",
              marginBottom: "1rem",
            }}
          >
            {neededMessage}
          </p>
        </div>

        {canShowScenarios &&
          simulationScenarios.length > 0 &&
          targetComponent && (
            <div
              style={{
                background: "rgba(0,0,0,0.05)",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => setIsScenariosOpen(!isScenariosOpen)}
              >
                <h4
                  style={{
                    margin: 0,
                    fontSize: "0.9rem",
                    color: "var(--text-color-2)",
                  }}
                >
                  {t("curricular_units:scenarios_title", {
                    weight: targetComponent.weight,
                  })}
                </h4>
                <span
                  style={{ fontSize: "0.8rem", color: "var(--text-color-2)" }}
                >
                  {isScenariosOpen ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </div>
              {isScenariosOpen && (
                <ul
                  style={{
                    margin: 0,
                    marginTop: "10px",
                    paddingLeft: "20px",
                    fontSize: "0.85rem",
                    color: "var(--text-color-2)",
                  }}
                >
                  {simulationScenarios.map((scenario, i) => (
                    <li key={i} style={{ marginBottom: "4px" }}>
                      {t("curricular_units:scenario_item", {
                        needed: scenario.needed.toFixed(1),
                        finalGrade: scenario.finalGrade,
                      })}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

        {cu.grades.length > 0 && (
          <div className={styles.gradeList}>
            {cu.grades.map((g, index) => (
              <GradeRow
                key={g.id}
                g={g}
                cuName={cu.name}
                index={index}
                isLocked={lockedGrades.includes(g.id)}
                onToggleLock={toggleLock}
                onDelete={handleDeleteGrade}
              />
            ))}
          </div>
        )}

        {!isTotalWeight100 ? (
          <CreateGrade
            curricularUnit={cu.name}
            onGradeCreated={onRefresh}
            totalWeight={totalWeight}
          />
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "12px",
              background: "rgba(0,0,0,0.05)",
              color: "var(--text-color-2)",
              borderRadius: "8px",
              fontWeight: "bold",
              marginTop: "1rem",
            }}
          >
            {t("curricular_units:evaluations_complete")}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 4. PÁGINA PRINCIPAL
// ==========================================
export default function CurricularUnitsPage() {
  const { t } = useTranslation(["curricular_units"]);
  const setGlobalError = useSetGlobalError();
  const [cuList, setCuList] = useState<CurricularUnit[]>([]);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  function refresh() {
    service
      .getCurricularUnits()
      .then((list) =>
        setCuList([...list.sort((a, b) => (b.id || 0) - (a.id || 0))]),
      )
      .catch(setGlobalError);
  }

  useEffect(() => {
    refresh();
  }, []);

  const stats = useMemo(() => {
    let totalEcts = 0;
    let weightedSum = 0;
    let completedEcts = 0;

    cuList.forEach((cu) => {
      const ects = cu.ects ?? 6;
      totalEcts += ects;
      const currentPoints = cu.grades.reduce(
        (acc, g) => acc + g.value * (g.weight / 100),
        0,
      );
      const totalWeight = cu.grades.reduce((acc, g) => acc + g.weight, 0);

      if (totalWeight > 0) {
        const predicted = (currentPoints / totalWeight) * 100;
        if (!isNaN(predicted)) {
          weightedSum += predicted * ects;
          completedEcts += ects;
        }
      }
    });

    return {
      globalAvg:
        completedEcts > 0 ? (weightedSum / completedEcts).toFixed(1) : "--",
      totalEcts,
      count: cuList.length,
    };
  }, [cuList]);

  return (
    <RequireAuthn>
      <div className={styles.pageContainer}>
        {cuList.length > 0 && (
          <div className={`${styles.dashboardGrid} tutorial-target-uc-stats`}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>
                {t("curricular_units:stat_avg_title")}
              </span>
              <span className={styles.statValue}>{stats.globalAvg}</span>
              <span className={styles.statSub}>
                {t("curricular_units:stat_avg_sub")}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>
                {t("curricular_units:stat_ects_title")}
              </span>
              <span className={styles.statValue}>{stats.totalEcts}</span>
              <span className={styles.statSub}>
                {t("curricular_units:stat_ects_sub", { count: stats.count })}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>
                {t("curricular_units:stat_semester_title")}
              </span>
              <span className={styles.statValue}>2º</span>
              <span className={styles.statSub}>2025/2026</span>
            </div>
          </div>
        )}

        <div className={styles.headerAction}>
          <h1 className={`${styles.pageTitle} tutorial-target-uc-header`}>
            {t("curricular_units:page_title")}
          </h1>
          {cuList.length > 0 && (
            <button
              className={`${styles.topCreateButton} tutorial-target-uc-create-more`}
              onClick={() => setCreateModalOpen(true)}
            >
              <FaPlus /> {t("curricular_units:btn_new_uc")}
            </button>
          )}
        </div>

        {cuList.length === 0 ? (
          <div
            className={`${styles.emptyStateWrapper} tutorial-target-uc-empty-form`}
          >
            <h2 className={styles.emptyStateTitle}>
              {t("curricular_units:empty_title")}
            </h2>
            <p className={styles.emptyStateText}>
              {t("curricular_units:empty_desc_1")}
              <br />
              {t("curricular_units:empty_desc_2")}
            </p>
            <div style={{ maxWidth: "400px", width: "100%" }}>
              <CreateCurricularUnitForm onCuCreated={refresh} />
            </div>
          </div>
        ) : (
          <div className={styles.ucGrid}>
            {cuList.map((cu, idx) => (
              <div
                key={cu.id || cu.name}
                className={
                  idx === 0 ? "tutorial-target-uc-simulator-first" : ""
                }
              >
                <CurricularUnitCard cu={cu} onRefresh={refresh} />
              </div>
            ))}
          </div>
        )}

        {isCreateModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h2
                style={{
                  marginTop: 0,
                  color: "#3E2723",
                  marginBottom: "1.5rem",
                }}
              >
                {t("curricular_units:modal_new_uc")}
              </h2>
              <CreateCurricularUnitForm
                onCuCreated={refresh}
                onClose={() => setCreateModalOpen(false)}
                isModal={true}
              />
            </div>
          </div>
        )}
      </div>
    </RequireAuthn>
  );
}
