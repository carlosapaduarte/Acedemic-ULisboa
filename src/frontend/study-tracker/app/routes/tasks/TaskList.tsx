import { useState } from "react";
import { Task } from "~/service/service";
import { TaskListItem } from "./TaskListItem/TaskListItem";
import { useTranslation } from "react-i18next";
import styles from "./tasksPage.module.css";
import {
  FaBolt,
  FaExclamation,
  FaRegClock,
  FaChevronDown,
  FaArrowUp,
  FaFilter,
  FaTriangleExclamation,
  FaArrowDown,
} from "react-icons/fa6";
import { Button } from "react-aria-components";

export function TaskList({
  tasks,
  onTaskClick,
  onTaskStatusUpdated,
  selectedTaskIds,
  onSelectionToggle,
  textColor,
}: {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskStatusUpdated: (task: Task) => void;
  selectedTaskIds?: number[];
  onSelectionToggle?: (task: Task) => void;
  textColor?: string;
}) {
  const { t } = useTranslation(["task"]);
  const [filterUrgent, setFilterUrgent] = useState(false);
  const [showOldCompleted, setShowOldCompleted] = useState(false);
  const [microTasksAtTop, setMicroTasksAtTop] = useState(true);

  if (!tasks || tasks.length === 0) {
    return (
      <div className={styles.emptyListContainer}>
        <p className={styles.emptyListText}>
          {t("task:no_tasks_associated", "Nenhuma tarefa para hoje")}
        </p>
      </div>
    );
  }

  const isUrgent = (task: Task) => {
    // É prioridade alta?
    if (task.data.priority === "high") return true;

    // Tem deadline próxima (<= 5 dias) ou atrasada?
    if (task.data.deadline) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const deadline = new Date(task.data.deadline);
      deadline.setHours(0, 0, 0, 0);

      const diffTime = deadline.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Se já passou ou é nos próximos 5 dias
      return diffDays <= 5;
    }
    return false;
  };

  const activeTasks = tasks.filter((t) => t.data.status !== "completed");
  const allCompletedTasks = tasks.filter((t) => t.data.status === "completed");

  const sortedActiveTasks = [...activeTasks].sort((a, b) => {
    const aIsMicro = a.data.is_micro_task ? 1 : 0;
    const bIsMicro = b.data.is_micro_task ? 1 : 0;

    if (aIsMicro === bIsMicro) return 0;

    return microTasksAtTop ? bIsMicro - aIsMicro : aIsMicro - bIsMicro;
  });

  const displayedTasks = filterUrgent
    ? sortedActiveTasks.filter(isUrgent)
    : sortedActiveTasks;

  const isCompletedToday = (isoDateString?: string) => {
    if (!isoDateString) return false;
    const completedDate = new Date(isoDateString);
    const today = new Date();

    return (
      completedDate.getDate() === today.getDate() &&
      completedDate.getMonth() === today.getMonth() &&
      completedDate.getFullYear() === today.getFullYear()
    );
  };

  const completedToday = allCompletedTasks.filter((t) =>
    isCompletedToday(t.data.completed_at)
  );

  const completedOld = allCompletedTasks.filter(
    (t) => !isCompletedToday(t.data.completed_at)
  );

  const renderList = (taskList: Task[]) =>
    taskList.map((task) => (
      <TaskListItem
        key={task.id}
        taskToDisplay={task}
        onTaskClick={onTaskClick}
        onTaskStatusUpdated={onTaskStatusUpdated}
        isSelected={selectedTaskIds?.includes(task.id)}
        onSelectionToggle={onSelectionToggle}
        textColor={textColor}
      />
    ));

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          marginBottom: "0.5rem",
        }}
      >
        <Button
          onPress={() => setFilterUrgent(!filterUrgent)}
          style={{
            background: filterUrgent ? "rgba(255, 77, 77, 0.2)" : "transparent",
            border: filterUrgent ? "1px solid #FF4D4D" : "none",
            borderRadius: "4px",
            color: filterUrgent ? "#FF4D4D" : "var(--text-color-1)",
            fontSize: "0.8rem",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            cursor: "pointer",
            padding: "2px 8px",
            transition: "all 0.2s",
          }}
        >
          <FaFilter size={10} />
          <span>Prioritárias / &lt;5 dias</span>
        </Button>

        {activeTasks.some((t) => t.data.is_micro_task) && (
          <Button
            onPress={() => setMicroTasksAtTop(!microTasksAtTop)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-color-1)",
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              cursor: "pointer",
              opacity: 0.8,
            }}
          >
            <FaBolt color="#FFD700" size={10} />
            {microTasksAtTop ? (
              <FaArrowUp style={{ color: "var(--text-color-1)" }} size={10} />
            ) : (
              <FaArrowDown style={{ color: "var(--text-color-1)" }} size={10} />
            )}
            <span style={{ marginLeft: "4px" }}>
              {microTasksAtTop ? "No topo" : "No fundo"}
            </span>
          </Button>
        )}
      </div>

      <div className={styles.activeList}>
        {renderList(displayedTasks)}

        <div style={{ opacity: 0.8 }}>{renderList(completedToday)}</div>
      </div>

      {/* Separador de tarefas completadas ANTIGAS */}
      {completedOld.length > 0 && (
        <>
          <div
            className={styles.completedSeparator}
            onClick={() => setShowOldCompleted(!showOldCompleted)}
          >
            <div className={styles.separatorTitle}>
              <span>
                {t("task:completed_tasks", "Tarefas concluídas anteriormente ")}
                ({completedOld.length})
              </span>
              <FaChevronDown
                size={12}
                className={`${styles.chevron} ${
                  showOldCompleted ? styles.open : ""
                }`}
              />
            </div>
            <div className={styles.separatorLine}></div>
          </div>

          {/* Lista de tarefas antigas (só aparece se for expandido) */}
          {showOldCompleted && (
            <div className={styles.oldTasksList} style={{ opacity: 0.6 }}>
              {renderList(completedOld)}
            </div>
          )}
        </>
      )}

      <div className={styles.legendContainer}>
        <div className={styles.legendItem}>
          <FaBolt color="#FFD700" />
          <span>{t("task:legend_flash_task", "Tarefa Relâmpago")}</span>
        </div>
        <div className={styles.legendItem}>
          <FaExclamation color="#FF4D4D" />
          <span>{t("task:legend_high_priority", "Prioridade Alta")}</span>
        </div>
        <div className={styles.legendItem}>
          <FaTriangleExclamation color="#FF4D4D" />
          <span>{t("task:legend_overdue", "Em Atraso")}</span>
        </div>
        <div className={styles.legendItem}>
          <FaRegClock className={styles.upcomingIcon} />
          <span>{t("task:legend_deadline", "Com Prazo")}</span>
        </div>
      </div>
    </div>
  );
}
