import { useEffect, useState, useMemo } from "react";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { CurricularUnit, service } from "~/service/service";
import { RequireAuthn } from "~/components/auth/RequireAuthn";
import styles from "./curricularUnitsPage.module.css";
import { FaPlus } from "react-icons/fa6";

// ==========================================
// 1. CRIAR NOTA
// ==========================================
function CreateGrade({
  curricularUnit,
  onGradeCreated,
  totalWeight,
}: {
  curricularUnit: string;
  onGradeCreated: () => void;
  totalWeight: number;
}) {
  const [value, setValue] = useState("");
  const [weight, setWeight] = useState("");
  const [error, setError] = useState<string>();

  function handleCreate() {
    const numValue = parseFloat(value);
    const numWeight = parseFloat(weight);

    if (isNaN(numValue) || isNaN(numWeight)) return;

    if (numValue < 0 || numValue > 20) {
      setError("A nota deve ser entre 0 e 20.");
      return;
    }
    if (totalWeight + numWeight > 100) {
      setError(`Peso excessivo. Máximo restante: ${100 - totalWeight}%`);
      return;
    }

    service
      .createGrade(curricularUnit, numValue, numWeight)
      .then(() => {
        setValue("");
        setWeight("");
        setError(undefined);
        onGradeCreated();
      })
      .catch((err) => {
        setError("Erro ao criar avaliação.");
        console.error(err);
      });
  }

  return (
    <div className={styles.addGradeSection}>
      <h4 className={styles.subTitle}>Adicionar Avaliação</h4>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Nota (0-20)</label>
          <input
            type="number"
            className={styles.input}
            placeholder="Ex: 14"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Peso (%)</label>
          <input
            type="number"
            className={styles.input}
            placeholder="Ex: 50"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
      </div>
      {error && (
        <p
          style={{
            color: "#FFCCBC",
            fontSize: "0.85rem",
            marginTop: "-10px",
            marginBottom: "10px",
          }}
        >
          {error}
        </p>
      )}
      <button
        className={styles.addButton}
        onClick={handleCreate}
        disabled={!value || !weight}
      >
        Confirmar
      </button>
    </div>
  );
}

// ==========================================
// 2. CRIAR UC (com ECTS)
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
  const [name, setName] = useState("");
  const [ects, setEcts] = useState("6"); // Valor default de 6 ECTS

  function handleSubmit() {
    if (!name || !ects) return;

    const numEcts = parseFloat(ects);
    if (isNaN(numEcts) || numEcts <= 0) return;

    service
      .createCurricularUnit(name, numEcts)
      .then(() => {
        // Tenta criar tag, se falhar ignora erro
        return service
          .createTag({
            name_pt: name,
            name_en: name,
            color: "#5DADE2",
            is_uc: true,
          } as any)
          .catch(() => {});
      })
      .then(() => {
        onCuCreated();
        if (onClose) onClose();
      });
  }

  const inputClass = isModal ? styles.modalInput : styles.modalInput;
  const labelClass = isModal ? styles.modalLabel : styles.modalLabel;

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          marginBottom: "1.5rem",
          display: "grid",
          gridTemplateColumns: isModal ? "3fr 1fr" : "1fr",
          gap: "1rem",
        }}
      >
        <div>
          <label className={labelClass}>Nome da Unidade Curricular</label>
          <input
            className={inputClass}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Análise Matemática II"
            value={name}
            autoFocus
          />
        </div>

        <div style={{ marginTop: isModal ? 0 : "1rem" }}>
          <label className={labelClass}>ECTS</label>
          <input
            type="number"
            className={inputClass}
            onChange={(e) => setEcts(e.target.value)}
            placeholder="6"
            value={ects}
          />
        </div>
      </div>

      {isModal ? (
        <div className={styles.modalActions}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancelar
          </button>
          <button className={styles.confirmButton} onClick={handleSubmit}>
            Criar
          </button>
        </div>
      ) : (
        <button
          className={styles.confirmButton}
          style={{ width: "100%" }}
          onClick={handleSubmit}
        >
          Criar Primeira UC
        </button>
      )}
    </div>
  );
}

// ==========================================
// 3. CARTÃO DE uc
// ==========================================
function CurricularUnitCard({
  cu,
  onRefresh,
}: {
  cu: CurricularUnit & { ects?: number };
  onRefresh: () => void;
}) {
  const setGlobalError = useSetGlobalError();

  const displayEcts = cu.ects || 6;

  const totalWeight = cu.grades.reduce((acc, g) => acc + g.weight, 0);
  const currentPoints = cu.grades.reduce(
    (acc, g) => acc + g.value * (g.weight / 100),
    0,
  );
  const maxPossible = currentPoints + 20 * ((100 - totalWeight) / 100);

  const getBarColor = () => {
    if (currentPoints >= 9.5) return "#66BB6A";
    if (maxPossible < 9.5) return "#EF5350";
    return "#FFCA28";
  };

  function handleDelete(id: number) {
    if (!confirm("Tem a certeza que deseja apagar esta nota?")) return;
    service.deleteGrade(cu.name, id).then(onRefresh).catch(setGlobalError);
  }

  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{cu.name}</h3>
        <span className={styles.ectsBadge}>{displayEcts} ECTS</span>
      </div>

      <div className={styles.simulatorContainer}>
        <div className={styles.progressLabels}>
          <span>
            Garantido: <strong>{currentPoints.toFixed(2)}</strong> val.
          </span>
          <span>
            Máximo Possível: <strong>{maxPossible.toFixed(2)}</strong> val.
          </span>
        </div>
        <div className={styles.progressBarBg}>
          <div
            className={styles.progressBarFill}
            style={{
              width: `${(currentPoints / 20) * 100}%`,
              backgroundColor: getBarColor(),
            }}
          ></div>
          <div
            className={styles.progressMarker}
            style={{ left: "47.5%" }}
            title="Meta 9.5"
          ></div>
        </div>
        <p className={styles.simulationText}>
          {currentPoints >= 9.5
            ? "🎉 Parabéns! Aprovação garantida"
            : maxPossible < 9.5
            ? "⚠️ Atenção: Já não é possível atingir o 9.5 com os pesos atuais."
            : `Faltam ${(9.5 - currentPoints).toFixed(
                2,
              )} valores absolutos para a aprovação.`}
        </p>
      </div>

      {cu.grades.length > 0 && (
        <div className={styles.gradeList}>
          {cu.grades.map((g) => (
            <div key={g.id} className={styles.gradeItem}>
              <div>
                <span className={styles.gradeValue}>{g.value}</span>
                <span className={styles.gradeWeight}>({g.weight}%)</span>
              </div>
              <button
                className={styles.deleteButton}
                onClick={() => handleDelete(g.id)}
              >
                Apagar
              </button>
            </div>
          ))}
        </div>
      )}

      {cu.grades.length === 0 && (
        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            fontStyle: "italic",
            marginBottom: "1.5rem",
          }}
        >
          Ainda sem avaliações lançadas.
        </p>
      )}

      <CreateGrade
        curricularUnit={cu.name}
        onGradeCreated={onRefresh}
        totalWeight={totalWeight}
      />
    </div>
  );
}

// ==========================================
// 4. PÁGINA PRINCIPAL
// ==========================================
export default function CurricularUnitsPage() {
  const setGlobalError = useSetGlobalError();
  const [cuList, setCuList] = useState<(CurricularUnit & { ects?: number })[]>(
    [],
  );
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  function refresh() {
    service
      .getCurricularUnits()
      .then((list) => {
        const sorted = list.sort((a, b) => (b.id || 0) - (a.id || 0));
        setCuList([...sorted]);
      })
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
      // Usa os ECTS da cadeira ou 6 se não estiver definido
      const ects = cu.ects || 6;
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

    const globalAvg =
      completedEcts > 0 ? (weightedSum / completedEcts).toFixed(1) : "--";
    return { globalAvg, totalEcts, count: cuList.length };
  }, [cuList]);

  return (
    <RequireAuthn>
      <div className={styles.pageContainer}>
        {/* DASHBOARD */}
        {cuList.length > 0 && (
          <div className={styles.dashboardGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Média Prevista</span>
              <span className={styles.statValue}>{stats.globalAvg}</span>
              <span className={styles.statSub}>Ponderada por ECTS</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Total ECTS</span>
              <span className={styles.statValue}>{stats.totalEcts}</span>
              <span className={styles.statSub}>
                {stats.count} UCs Inscritas
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Semestre Atual</span>
              <span className={styles.statValue}>2º</span>
              <span className={styles.statSub}>2025/2026</span>
            </div>
          </div>
        )}

        <div className={styles.headerAction}>
          <h1 className={styles.pageTitle}>As Minhas Unidades Curriculares</h1>
          {cuList.length > 0 && (
            <button
              className={styles.topCreateButton}
              onClick={() => setCreateModalOpen(true)}
            >
              <FaPlus /> Nova UC
            </button>
          )}
        </div>

        {cuList.length === 0 ? (
          <div className={styles.emptyStateWrapper}>
            <h2 className={styles.emptyStateTitle}>Percurso Académico</h2>
            <p className={styles.emptyStateText}>
              Ainda não tens unidades curriculares registadas.
              <br />
              Adiciona a tua primeira UC para começares a simular as tuas notas.
            </p>
            <div style={{ maxWidth: "400px", width: "100%" }}>
              <CreateCurricularUnitForm onCuCreated={refresh} />
            </div>
          </div>
        ) : (
          <div className={styles.ucGrid}>
            {cuList.map((cu, idx) => (
              <CurricularUnitCard key={idx} cu={cu} onRefresh={refresh} />
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
                Nova UC
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
