import { useTranslation } from "react-i18next";
import { TaskList } from "~/routes/tasks/TaskList";
import { CreateTaskButton } from "~/routes/tasks/CreateTask/CreateTask";
import { useNavigate, useOutletContext } from "@remix-run/react";
import { Task } from "~/service/service";
import styles from "./taskListPage.module.css";
import React from "react";

import { QuickTaskForm } from "~/routes/tasks/QuickTaskForm/QuickTaskForm";

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

  const { mainTasks, microTasks } = React.useMemo(() => {
    if (!tasks) return { mainTasks: [], microTasks: [] };

    const main: Task[] = [];
    const micro: Task[] = [];

    for (const task of tasks) {
      if (task.data.is_micro_task) {
        micro.push(task);
      } else {
        main.push(task);
      }
    }
    return { mainTasks: main, microTasks: micro };
  }, [tasks]);

  if (!tasks) return <div>{t("task:loading")}</div>;

  return (
    <div className={styles.taskListPage}>
      <div className={styles.layoutContainer}>
        <div className={styles.mainTasksColumn}>
          <div className={styles.header}>
            <h1 className={styles.tasksListTitle}>
              {t("task:my_tasks_list_title", "Tarefas Principais")}
            </h1>
            <CreateTaskButton onTaskCreated={onTaskCreated} />
          </div>
          <div className={styles.taskListContainer}>
            <TaskList
              tasks={mainTasks}
              onTaskClick={(task: Task) => {
                navigate(`/tasks/${task.id}`);
              }}
              onTaskStatusUpdated={() => {
                refreshTasks();
              }}
            />
          </div>
        </div>

        <div className={styles.microTasksColumn}>
          <h1 className={styles.tasksListTitle}>
            {t("task:micro_tasks_list_title", "Tarefas Relâmpago")}
          </h1>
          <QuickTaskForm onTaskCreated={onTaskCreated} />
          <div className={styles.taskListContainer}>
            <TaskList
              tasks={microTasks}
              onTaskClick={(task: Task) => {
                navigate(`/tasks/${task.id}`);
              }}
              onTaskStatusUpdated={() => {
                refreshTasks(); // Simplesmente recarrega a lista
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
