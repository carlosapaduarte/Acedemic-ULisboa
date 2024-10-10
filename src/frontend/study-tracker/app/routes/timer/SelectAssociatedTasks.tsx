import { useState } from "react";
import { Task } from "~/service/service";
import { TaskList, useTaskList } from "~/routes/tasks/TaskList";
import { useTranslation } from "react-i18next";

export function SelectAssociatedTasks({ onTasksSelected }: { onTasksSelected: (tasks: Task[]) => void }) {
    // Lists tasks and allows to select pick those tasks (except Tasks that are concluded!)
    // Operation is completed if user presses "Confirm" button

    const { t } = useTranslation(["study"]);

    const { tasks, refreshTasks } = useTaskList(true);
    const [associatedTasks, setAssociatedTasks] = useState<Task[]>([]);

    function onTaskSelected(task: Task) {
        const newTasks = [...associatedTasks];
        newTasks.push(task);
        setAssociatedTasks(newTasks);
    }

    return tasks ?
        <div>
            <h1>
                {t("study:associate_tasks")}
            </h1>
            <TaskList tasks={tasks} onTaskClick={onTaskSelected} onTaskStatusUpdated={() => refreshTasks()} />
            <button onClick={() => onTasksSelected(associatedTasks)}>
                {t("study:confirm_associated_tasks")}
            </button>
        </div>
        :
        <></>;
}