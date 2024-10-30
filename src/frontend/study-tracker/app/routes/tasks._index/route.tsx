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
        tasks: Task[],
        setTasks: (tasks: Task[] | ((prevTasks: Task[]) => Task[])) => void,
        refreshTasks: () => void
    }>();

    function onTaskCreated() {
        refreshTasks();
    }

    if (!tasks)
        return <div>{t("task:loading")}</div>;

    return (
        <div className={styles.taskListPage}>
            <h1 className={styles.tasksListTitle}>{t("task:my_tasks_list_title")}</h1>
            <CreateTaskButton onTaskCreated={onTaskCreated} />
            <div className={styles.taskListContainer}>
                <TaskList tasks={tasks}
                          onTaskClick={(task: Task) => {
                              navigate(`/tasks/${task.id}`);
                          }}
                          onTaskStatusUpdated={(updatedTask) => {
                              setTasks(prevTasks => {
                                  return prevTasks.map(task =>
                                      task.id === updatedTask.id ? updatedTask : task
                                  );
                              });
                          }} />
            </div>
        </div>
    );
}