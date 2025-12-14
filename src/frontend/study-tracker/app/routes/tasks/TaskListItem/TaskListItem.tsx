import React, { useState, useRef } from "react";
import { service, Task } from "~/service/service";
import styles from "./taskListItem.module.css";
import classNames from "classnames";
import Confetti from "react-confetti";
import { TaskCheckbox } from "~/components/Checkbox/TaskCheckbox";
import {
  FaBolt,
  FaExclamation,
  FaRegClock,
  FaTrash,
  FaTriangleExclamation,
} from "react-icons/fa6";

const desenhaConfetisPequenos = (ctx: CanvasRenderingContext2D) => {
  ctx.rect(0, 0, 6, 12);
  ctx.fill();
};

function useTaskView(task: Task, onTaskStatusUpdated: (task: Task) => void) {
  const [internalTask, setInternalTask] = useState<Task>(task);

  function updateTask(callback?: (updatedTask: Task) => void) {
    service
      .getTask(task.id)
      .then((updatedTask: Task) => {
        setInternalTask(updatedTask);
        if (callback) {
          callback(updatedTask);
        }
      })
      .catch((error) => {});
  }

  function updateTaskStatus(newStatus: string) {
    service
      .updateTaskStatus(task.id, newStatus)
      .then(() => {
        updateTask((updatedTask) => {
          if (newStatus === "completed") {
            setTimeout(() => {
              onTaskStatusUpdated(updatedTask);
            }, 600);
          } else {
            onTaskStatusUpdated(updatedTask);
          }
        });
      })
      .catch((error) => {});
  }

  return { internalTask, updateTaskStatus };
}

export function TaskListItem({
  taskToDisplay,
  onTaskClick,
  onTaskStatusUpdated,
  isSelected,
  onSelectionToggle,
  textColor,
}: {
  taskToDisplay: Task;
  onTaskClick: (task: Task) => void;
  onTaskStatusUpdated: (task: Task) => void;
  isSelected?: boolean;
  onSelectionToggle?: (task: Task) => void;
  textColor?: string;
}) {
  const { internalTask, updateTaskStatus } = useTaskView(
    taskToDisplay,
    onTaskStatusUpdated
  );
  const [showConfetti, setShowConfetti] = useState(false);
  const checkboxRef = useRef<HTMLDivElement>(null);
  const [confettiSource, setConfettiSource] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  const isSelectionMode = onSelectionToggle !== undefined;

  const isChecked = isSelectionMode
    ? isSelected
    : internalTask.data.status == "completed";

  // Só mostra o riscado se NÃO estivermos em modo de seleção
  const showStrikeThrough =
    !isSelectionMode && internalTask.data.status == "completed";

  const isHighPriority = internalTask.data.priority === "high";

  const isUpcoming = () => {
    if (!internalTask.data.deadline) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const deadline = new Date(internalTask.data.deadline);
    deadline.setHours(0, 0, 0, 0);

    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays >= 0 && diffDays <= 5;
  };

  const showClock = isUpcoming() && internalTask.data.status !== "completed";

  const StatusIcons = () => (
    <div className={styles.iconsContainer}>
      {isHighPriority && (
        <span title="Alta Prioridade">
          <FaExclamation className={styles.priorityIcon} color="#FF4D4D" />
        </span>
      )}

      {internalTask.data.deadline ? (
        new Date(internalTask.data.deadline) < new Date() &&
        internalTask.data.status !== "completed" ? (
          <span title="Em Atraso">
            <FaTriangleExclamation
              className={styles.overdueIcon}
              color="#FF4D4D"
            />
          </span>
        ) : (
          internalTask.data.status !== "completed" && (
            <span
              title={new Date(internalTask.data.deadline).toLocaleDateString()}
            >
              <FaRegClock className={styles.upcomingIcon} />
            </span>
          )
        )
      ) : null}
    </div>
  );

  const handleDelete = async () => {
    if (
      window.confirm(
        `Tens a certeza que queres apagar a tarefa relâmpago"${internalTask.data.title}"?`
      )
    ) {
      try {
        await service.deleteTask(internalTask.id);
        onTaskStatusUpdated(internalTask);
      } catch (error) {
        console.error("Erro ao apagar tarefa relâmpago:", error);
      }
    }
  };

  return (
    <>
      {internalTask.data.is_micro_task ? (
        <div
          aria-checked={!!isChecked}
          className={classNames(styles.checkboxAndTitleContainer, {
            [styles.completedTask]: showStrikeThrough,
          })}
        >
          <div className={styles.checkboxContainer}>
            <TaskCheckbox
              checked={!!isChecked}
              onClick={() => {
                if (isSelectionMode) {
                  onSelectionToggle(internalTask);
                } else {
                  const newStatus =
                    internalTask.data.status == "completed"
                      ? "not_completed"
                      : "completed";
                  updateTaskStatus(newStatus);
                }
              }}
              className={styles.listCheckbox}
            />
          </div>
          <div className={styles.iconsContainer}>
            <FaBolt className={styles.microTaskIcon} />
          </div>
          <div
            className={classNames(
              styles.taskTitleContainer,
              showStrikeThrough && styles.strikeThrough
            )}
          >
            <p
              className={classNames(
                styles.taskTitle,
                showStrikeThrough && styles.strikeThrough
              )}
              style={{ color: textColor }}
            >
              {internalTask.data.title}
            </p>
          </div>

          {!isSelectionMode && (
            <button onClick={handleDelete} className={styles.deleteButton}>
              <FaTrash />
            </button>
          )}
        </div>
      ) : (
        <>
          {showConfetti && confettiSource && (
            <Confetti
              recycle={false}
              confettiSource={confettiSource}
              onConfettiComplete={() => {
                setShowConfetti(false);
                setConfettiSource(null);
              }}
              numberOfPieces={40}
              gravity={0.3}
              drawShape={desenhaConfetisPequenos}
            />
          )}

          <div
            aria-checked={!!isChecked}
            className={classNames(styles.checkboxAndTitleContainer, {
              [styles.selectedTask]: isSelectionMode && isSelected,
              [styles.completedTask]: showStrikeThrough,
            })}
          >
            <div className={styles.checkboxContainer} ref={checkboxRef}>
              <TaskCheckbox
                checked={!!isChecked}
                onClick={() => {
                  if (isSelectionMode) {
                    onSelectionToggle(internalTask);
                  } else {
                    if (internalTask.data.status == "completed") {
                      updateTaskStatus("not_completed");
                    } else {
                      updateTaskStatus("completed");
                      if (checkboxRef.current) {
                        const rect =
                          checkboxRef.current.getBoundingClientRect();
                        setConfettiSource({
                          x: rect.x + rect.width / 2,
                          y: rect.y + rect.height / 2,
                          w: 0,
                          h: 0,
                        });
                      }
                      setShowConfetti(true);
                    }
                  }
                }}
                className={styles.listCheckbox}
              />
            </div>
            <StatusIcons />
            <button
              className={classNames(
                styles.taskTitleContainer,
                showStrikeThrough && styles.strikeThrough
              )}
              onClick={() => onTaskClick(internalTask)}
            >
              <p
                className={classNames(
                  styles.taskTitle,
                  showStrikeThrough && styles.strikeThrough
                )}
                style={{ color: textColor }}
              >
                {internalTask.data.title}
              </p>
            </button>
          </div>
        </>
      )}
    </>
  );
}
