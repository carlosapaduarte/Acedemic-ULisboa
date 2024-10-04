import { CreateTaskButton } from "./CreateTask/CreateTask";
import { TaskList, useTaskList } from "./TaskList";
import styles from "./tasksPage.module.css";
import { RequireAuthn } from "~/components/auth/RequireAuthn";
import { useTranslation } from "react-i18next";

function RenderPage() {
    const { t } = useTranslation(["task"]);

    const { tasks, refreshTasks } = useTaskList(false);

    function onTaskCreated() {
        refreshTasks();
    }

    if (!tasks)
        return <div>{t("task:loading")}</div>;

    return (
        <div>
            <TaskList tasks={tasks} onTaskClick={undefined} onTaskStatusUpdated={undefined} />
            <CreateTaskButton onTaskCreated={onTaskCreated} />
        </div>
    );
}

export default function TaskPage() {
    return (
        <RequireAuthn>
            <div className={styles.tasksPage}>
                <RenderPage />
            </div>
        </RequireAuthn>
    );
}