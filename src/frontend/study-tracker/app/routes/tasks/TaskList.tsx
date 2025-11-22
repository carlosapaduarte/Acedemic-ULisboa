import { Task } from "~/service/service";
import { TaskListItem } from "./TaskListItem/TaskListItem";
import { useTranslation } from "react-i18next";
import styles from "./tasksPage.module.css";

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

  if (!tasks || tasks.length === 0) {
    return (
      <div className={styles.emptyListContainer}>
        <p className={styles.emptyListText}>
          {t("task:no_tasks_associated", "Nenhuma tarefa para hoje")}
        </p>
      </div>
    );
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.data.status === "completed" && b.data.status !== "completed") {
      return 1;
    }
    if (a.data.status !== "completed" && b.data.status === "completed") {
      return -1;
    }
    return 0;
  });

  return (
    <div>
      {sortedTasks?.map((task: Task, index: number) => (
        <TaskListItem
          key={task.id}
          taskToDisplay={task}
          onTaskClick={onTaskClick}
          onTaskStatusUpdated={onTaskStatusUpdated}
          isSelected={selectedTaskIds?.includes(task.id)}
          onSelectionToggle={onSelectionToggle}
          textColor={textColor}
        />
      ))}
    </div>
  );
}
