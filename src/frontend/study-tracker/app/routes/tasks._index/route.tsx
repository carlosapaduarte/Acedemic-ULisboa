import { useTranslation } from "react-i18next";
import { TaskList } from "~/routes/tasks/TaskList";
import { CreateTaskButton } from "~/routes/tasks/CreateTask/CreateTask";
import { useNavigate, useOutletContext } from "@remix-run/react";
import { Task } from "~/service/service";
import styles from "./taskListPage.module.css";

export default function TasksPage() {
  const { t } = useTranslation(["task"]);
  const navigate = useNavigate();

  const { tasks, setTasks, refreshTasks } = useOutletContext<{
    tasks: Task[];
    setTasks: (tasks: Task[] | ((prevTasks: Task[]) => Task[])) => void;
    refreshTasks: () => void;
  }>();

  function onTaskCreated() {
    refreshTasks();
  }

  if (!tasks) return <div>{t("task:loading")}</div>;

  return (
    <div className={styles.taskListPage}>
      <div className={styles.header}>
        <h1 className={styles.tasksListTitle}>
          {t("task:my_tasks_list_title", "As minhas tarefas")}
        </h1>
        <CreateTaskButton onTaskCreated={onTaskCreated} />
      </div>

      <div className={styles.taskListContainer}>
        <TaskList
          tasks={tasks}
          onTaskClick={(task: Task) => {
            if (!task.data.is_micro_task) {
              navigate(`/tasks/${task.id}`);
            }
          }}
          onTaskStatusUpdated={(updatedTask) => {
            refreshTasks();
          }}
        />
      </div>
    </div>
  );
}
