import React, { useState, useRef, useEffect } from "react";
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
  FaPlus,
} from "react-icons/fa6";

const desenhaConfetisPequenos = (ctx: CanvasRenderingContext2D) => {
  ctx.rect(0, 0, 6, 12);
  ctx.fill();
};

function useTaskView(task: Task, onTaskStatusUpdated: (task: Task) => void) {
  const [internalTask, setInternalTask] = useState<Task>(task);

  useEffect(() => {
    setInternalTask(task);
  }, [task]);

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
  onAddSubtask,
}: {
  taskToDisplay: Task;
  onTaskClick: (task: Task) => void;
  onTaskStatusUpdated: (task: Task) => void;
  isSelected?: boolean;
  onSelectionToggle?: (task: Task) => void;
  textColor?: string;
  onAddSubtask?: (parentId: number) => void;
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
        `Tens a certeza que queres apagar a tarefa "${internalTask.data.title}"?`
      )
    ) {
      try {
        await service.deleteTask(internalTask.id);
        onTaskStatusUpdated(internalTask);
      } catch (error) {
        console.error("Erro ao apagar tarefa:", error);
      }
    }
  };

  // --- RENDER ---
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <div
        aria-checked={!!isChecked}
        className={classNames(styles.checkboxAndTitleContainer, {
          [styles.selectedTask]: isSelectionMode && isSelected,
          [styles.completedTask]: showStrikeThrough,
        })}
      >
        {/* Confetti */}
        {!internalTask.data.is_micro_task && showConfetti && confettiSource && (
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

        {/* Checkbox */}
        <div className={styles.checkboxContainer} ref={checkboxRef}>
          <TaskCheckbox
            checked={!!isChecked}
            onClick={() => {
              if (isSelectionMode) {
                onSelectionToggle && onSelectionToggle(internalTask);
              } else {
                const newStatus =
                  internalTask.data.status == "completed"
                    ? "not_completed"
                    : "completed";
                updateTaskStatus(newStatus);
                if (
                  newStatus === "completed" &&
                  !internalTask.data.is_micro_task
                ) {
                  if (checkboxRef.current) {
                    const rect = checkboxRef.current.getBoundingClientRect();
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

        {/* Ícone Micro Task */}
        {internalTask.data.is_micro_task && (
          <div className={styles.iconsContainer}>
            <FaBolt className={styles.microTaskIcon} />
          </div>
        )}

        {/* Status Icons */}
        {!internalTask.data.is_micro_task && <StatusIcons />}

        {/* Título (Clicável) */}
        <button
          className={classNames(
            styles.taskTitleContainer,
            showStrikeThrough && styles.strikeThrough
          )}
          onClick={() => onTaskClick(internalTask)}
          style={{ flex: 1, textAlign: "left" }}
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

        {/* Botões de Ação (Subtarefa e Delete) */}
        {!isSelectionMode && (
          <div
            className={styles.actionsContainer}
            style={{ display: "flex", gap: "8px" }}
          >
            {onAddSubtask && !internalTask.data.is_micro_task && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddSubtask(internalTask.id);
                }}
                className={styles.actionButton}
                title="Adicionar Subtarefa"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  opacity: 0.6,
                }}
              >
                <FaPlus size={12} />
              </button>
            )}

            <button
              onClick={handleDelete}
              className={styles.deleteButton}
              title="Apagar Tarefa"
            >
              <FaTrash />
            </button>
          </div>
        )}
      </div>

      {/* 2. RECURSÃO: RENDERIZAR AS SUBTAREFAS */}
      {internalTask.subTasks && internalTask.subTasks.length > 0 && (
        <div
          style={{
            paddingLeft: "24px",
            borderLeft: "2px solid rgba(0,0,0,0.05)",
            marginLeft: "10px",
            marginTop: "4px",
          }}
        >
          {internalTask.subTasks.map((subTask) => (
            <TaskListItem
              key={subTask.id}
              taskToDisplay={subTask}
              onTaskClick={onTaskClick}
              onTaskStatusUpdated={onTaskStatusUpdated}
              isSelected={isSelected}
              onSelectionToggle={onSelectionToggle}
              textColor={textColor}
              onAddSubtask={onAddSubtask}
            />
          ))}
        </div>
      )}
    </div>
  );
}
