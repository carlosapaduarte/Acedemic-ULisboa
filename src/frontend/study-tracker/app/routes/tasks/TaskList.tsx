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
} from "react-icons/fa6";

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

  const [showOldCompleted, setShowOldCompleted] = useState(false);

  if (!tasks || tasks.length === 0) {
    return (
      <div className={styles.emptyListContainer}>
        <p className={styles.emptyListText}>
          {t("task:no_tasks_associated", "Nenhuma tarefa para hoje")}
        </p>
      </div>
    );
  }

  const activeTasks = tasks.filter((t) => t.data.status !== "completed");
  const allCompletedTasks = tasks.filter((t) => t.data.status === "completed");

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
      <div className={styles.activeList}>
        {renderList(activeTasks)}

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
          <FaRegClock color="#FFA500" />
          <span>{t("task:legend_overdue", "Em Atraso")}</span>
        </div>
      </div>
    </div>
  );
}
