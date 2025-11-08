import React, { useState, useRef } from "react";
import { service, Task } from "~/service/service";
import styles from "./taskListItem.module.css";
import classNames from "classnames";
import Confetti from "react-confetti";
import { TaskCheckbox } from "~/components/Checkbox/TaskCheckbox";

function useTaskView(task: Task, onTaskStatusUpdated: (task: Task) => void) {
  const [internalTask, setInternalTask] = useState<Task>(task);

  function updateTask() {
    service
      .getTask(task.id)
      .then((updatedTask: Task) => {
        setInternalTask(updatedTask);
        onTaskStatusUpdated(updatedTask);
      })
      .catch((error) => {});
  }

  function updateTaskStatus(newStatus: string) {
    service
      .updateTaskStatus(task.id, newStatus)
      .then(() => {
        updateTask();
      })
      .catch((error) => {});
  }

  function passedDeadline(): boolean {
    if (internalTask.data.deadline == undefined) return false;
    return internalTask.data.deadline < new Date();
  }
  return { internalTask, updateTaskStatus };
}

export function TaskListItem({
  taskToDisplay,
  onTaskClick,
  onTaskStatusUpdated,
  isSelected,
  onSelectionToggle,
}: {
  taskToDisplay: Task;
  onTaskClick: (task: Task) => void;
  onTaskStatusUpdated: (task: Task) => void;
  isSelected?: boolean;
  onSelectionToggle?: (task: Task) => void;
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

  return (
    <>
      {showConfetti && confettiSource && (
        <Confetti
          recycle={false}
          numberOfPieces={50}
          confettiSource={confettiSource}
          onConfettiComplete={() => {
            setShowConfetti(false);
            setConfettiSource(null);
          }}
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
          >
            {internalTask.data.title}
          </p>
        </button>
      </div>
    </>
  );
}
