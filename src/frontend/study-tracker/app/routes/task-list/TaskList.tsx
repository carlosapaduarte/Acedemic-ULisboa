import { service, Task } from "~/service/service";
import { TaskView } from "./Task";
import { useEffect, useState } from "react";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { useTranslation } from "react-i18next";

import styles from "./tasksPage.module.css";

export function useTaskList(filterUncompletedTasks: boolean) {
    const [tasks, setTasks] = useState<Task[] | undefined>(undefined);
    const setError = useSetGlobalError();

    useEffect(() => {
        refreshTasks();
    }, []);

    function refreshTasks() {
        service.getTasks(filterUncompletedTasks)
            .then((tasksUpdated: Task[]) => setTasks(tasksUpdated))
            .catch((error) => setError(error));
    }

    return { tasks, refreshTasks };
}

export function TaskList({ tasks, onTaskClick, onTaskStatusUpdated = undefined }: {
    tasks: Task[],
    onTaskClick: ((taskId: Task) => void) | undefined,
    onTaskStatusUpdated: (() => void) | undefined
}) {
    const { t } = useTranslation(["task"]);

    return (
        <div>
            <h1 className={styles.tasksListTitle}>{t("task:my_tasks_list_title")}</h1>
            {tasks?.map((task: Task, index: number) =>
                <div key={index}>
                    {onTaskClick ?
                        <button onClick={() => onTaskClick(task)}>
                            {t("task:tags_list_title")}
                        </button>
                        :
                        <></>
                    }
                    <TaskView taskToDisplay={task} onTaskStatusUpdated={onTaskStatusUpdated} />
                </div>
            )}
        </div>
    );
}