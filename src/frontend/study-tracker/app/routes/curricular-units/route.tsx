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

  const wrapperClass = isModal ? styles.formWrapperModal : styles.formWrapperPage;

  return (
    <div>
      <div className={wrapperClass}>
        <div className={styles.formColLarge}>
          <label className={styles.modalLabel}>
            {t("curricular_units:label_uc_name")}
          </label>
          <input
            className={styles.modalInput}
            onChange={(e) => {
              setName(e.target.value);
              setError(undefined);
            }}
            placeholder={t("curricular_units:placeholder_uc_name")}
            value={name}
            autoFocus
          />
        </div>
        <div className={styles.formColSmall}>
          <label className={styles.modalLabel}>ECTS</label>
          <input
            type="number"
            className={styles.modalInput}
            onChange={(e) => setEcts(e.target.value)}
            placeholder="6"
            value={ects}
          />
        </div>
        <div className={styles.formColSmall}>
          <label className={styles.modalLabel}>
            {t("curricular_units:label_min_grade", "Nota Min.")}
          </label>
          <input
            type="number"
            className={styles.modalInput}
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
          />
        </div>
      </div>
      {error && (
        <p className={styles.errorText}>
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
          onClick={handleSubmit}
        >
          {t("curricular_units:btn_create_first")}
        </button>
      )}
    </div>
  );
}

// ==========================================
// COMPONENTE PARA CADA NOTA
// ==========================================
function GradeRow({
  g,
  cuName,
  index,
  isLocked,
  onToggleLock,
  onDelete,
  onUpdate,
  onSimulate,
}: {
  g: any;
  cuName: string;
  index: number;
  isLocked: boolean;
  onToggleLock: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: () => void;
  onSimulate: (val: number) => void;
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
          // CHAMA O REFRESH DA LISTA ASSIM QUE A BD GRAVA
          onUpdate();
        } catch (e) {
          console.error(e);
        }
      }, 800);

      return () => clearTimeout(timeoutId);
    }
  }, [localValue, g.value, cuName, g.id, compName, onUpdate]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let strVal = e.target.value;
    if (strVal !== "") {
      let num = parseFloat(strVal);
      if (num > 20) strVal = "20";
      if (num < 0) strVal = "0";
    }
    setLocalValue(strVal);
    // ATUALIZA A BARRA DE PROGRESSO INSTANTANEAMENTE NA UI
    onSimulate(parseFloat(strVal) || 0);
  };

  return (
    <div className={`${styles.gradeItem} ${isLocked ? styles.gradeItemLocked : styles.gradeItemUnlocked}`}>
      <div className={styles.gradeInfoWrapper}>
        <span className={styles.gradeName}>
          {compName} <span className={styles.gradeWeight}>({g.weight}%)</span>
        </span>

        <div className={styles.gradeInputWrapper}>
          <input
            type="number"
            disabled={isLocked}
            value={localValue}
            placeholder="0.0"
            min="0"
            max="20"
            step="0.1"
            onChange={handleValueChange}
            className={styles.gradeInput}
          />
          <span className={styles.gradeValLabel}>
            val.
          </span>
        </div>
      </div>

      <div className={styles.gradeActionsWrapper}>
        <button
          onClick={() => onToggleLock(g.id)}
          className={`${styles.btnLock} ${!isLocked && styles.btnLockUnlocked}`}
        >
          {isLocked ? <FaLock /> : <FaUnlock />}
        </button>
        <button
          onClick={() => onDelete(g.id)}
          disabled={isLocked}
          className={styles.btnDelGrade}
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

  const handleSimulate = (id: number, newValue: number) =>
    setSimulatedValues((prev) => ({ ...prev, [id]: newValue }));

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

  function handleDeleteGrade(id: number) {
    service.deleteGrade(cu.name, id).then(onRefresh).catch(console.error);
  }

  let neededMessage = "";

  if (hasTarget && targetGrade < minGrade) {
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

  return (
    <div className={`tutorial-target-uc-card`}>
      <div className={styles.cardContainer}>
        {isEditingUC ? (
          <div className={styles.editUcContainer}>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className={styles.input}
            />
            <div className={styles.editUcInputGroup}>
              <input
                type="number"
                value={editEcts}
                onChange={(e) => setEditEcts(e.target.value)}
                className={styles.input}
              />
              <span className={styles.editUcLabel}>
                ECTS
              </span>
            </div>
            <div className={styles.editUcInputGroup}>
              <input
                type="number"
                value={editMinGrade}
                onChange={(e) => {
                  let v = e.target.value;
                  if (v !== "" && parseFloat(v) > 20) v = "20";
                  setEditMinGrade(v);
                }}
                className={styles.input}
                min="0"
                max="20"
                step="0.1"
              />
              <span className={styles.editUcLabel}>
                Min
              </span>
            </div>
            <button onClick={handleSaveEditUC} className={styles.btnSaveUc}>
              <FaCheck />
            </button>
            <button onClick={() => setIsEditingUC(false)} className={styles.btnCancelUc}>
              <FaXmark />
            </button>
          </div>
        ) : (
          <div className={styles.cardHeader}>
            <div className={styles.headerTitleWrapper}>
              <h3 className={styles.cardTitle}>
                {cu.name}
              </h3>
              <span className={styles.ectsBadge}>
                {displayEcts} ECTS
              </span>
              <span className={styles.minGradeBadge}>
                Min: {minGrade}
              </span>
            </div>
            <div className={styles.headerActionsWrapper}>
              <button
                onClick={handleStartEdit}
                className={styles.btnActionIcon}
                title="Editar UC"
              >
                <FaPen size={14} />
              </button>
              <button
                onClick={handleDeleteUC}
                className={styles.btnActionIconDel}
                title={t("curricular_units:btn_delete_uc")}
              >
                <FaTrash size={14} />
              </button>
            </div>
          </div>
        )}

        <div className={styles.simulatorContainer}>
          <div className={styles.progressLabels}>
            <span>
              {t("curricular_units:label_current")}{" "}
              <strong style={{ fontSize: "1.2rem" }}>
                {currentPoints.toFixed(2)}
              </strong>{" "}
              val.
            </span>
            <span className={styles.targetInputWrapper}>
              <FaBullseye color="var(--color-3)" />{" "}
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
                className={styles.targetInput}
              />
            </span>
          </div>

          <div style={{ position: "relative", marginTop: "30px", marginBottom: "15px" }}>
            
            {/* O estilo dinâmico 'left' permanece inline por obrigação do React */}
            <div className={`${styles.progressMarkerWrapper} ${styles.markerMin}`} style={{ left: `${(minGrade / 20) * 100}%` }}>
              <span className={styles.progressMarkerLabel}>
                {t("curricular_units:label_min_grade")}
              </span>
              <div className={styles.progressMarkerLine}></div>
            </div>

            {hasTarget && (
              <div className={`${styles.progressMarkerWrapper} ${styles.markerTarget}`} style={{ left: `${(targetGrade / 20) * 100}%` }}>
                <span className={styles.progressMarkerLabel}>
                  {t("curricular_units:label_target_short", "Meta")}
                </span>
                <div className={styles.progressMarkerLine}></div>
              </div>
            )}

            <div className={styles.progressBarBg}>
              <div
                className={styles.progressFillLocked}
                style={{ width: `${(lockedPoints / 20) * 100}%` }}
              ></div>
              <div
                className={styles.progressFillUnlocked}
                style={{ width: `${(unlockedPoints / 20) * 100}%` }}
              ></div>
            </div>
          </div>

          <p className={styles.simulationText}>
            {neededMessage}
          </p>
        </div>

        {canShowScenarios &&
          simulationScenarios.length > 0 &&
          targetComponent && (
            <div className={styles.scenariosContainer}>
              <div
                className={styles.scenariosHeader}
                onClick={() => setIsScenariosOpen(!isScenariosOpen)}
              >
                <h4 className={styles.scenariosTitle}>
                  {t("curricular_units:scenarios_title", {
                    weight: targetComponent.weight,
                  })}
                </h4>
                <span className={styles.scenariosIcon}>
                  {isScenariosOpen ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </div>
              {isScenariosOpen && (
                <ul className={styles.scenariosList}>
                  {simulationScenarios.map((scenario, i) => (
                    <li key={i} className={styles.scenariosItem}>
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
                onUpdate={onRefresh} // Adicionado: Refresh na BD
                onSimulate={(val) => handleSimulate(g.id, val)} // Adicionado: Instant update
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
          <div className={styles.evaluationsComplete}>
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
            <div>
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
              <h2 className={styles.modalTitle}>
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