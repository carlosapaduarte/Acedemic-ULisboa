import { Task } from "~/service/service";
import { TaskListItem } from "./TaskListItem/TaskListItem";
import { useTranslation } from "react-i18next";

const styles = {
  emptyListContainer: "emptyListContainer",
  emptyListText: "emptyListText",
};

export function TaskList({
  tasks,
  onTaskClick,
  onTaskStatusUpdated,
}: {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskStatusUpdated: (task: Task) => void;
}) {
  const { t } = useTranslation(["task"]);
  console.log("tasks", tasks);

  if (!tasks || tasks.length === 0) {
    return (
      <div className={styles.emptyListContainer}>
        <p className={styles.emptyListText}>
          {t(
            "task:no_tasks_associated",
            "Nenhuma tarefa associada a esta sessão."
          )}
        </p>
      </div>
    );
  }

  return (
    <div>
      {tasks?.map((task: Task, index: number) => (
        <TaskListItem
          key={task.id}
          taskToDisplay={task}
          onTaskClick={onTaskClick}
          onTaskStatusUpdated={onTaskStatusUpdated}
        />
      ))}
    </div>
  );
}
