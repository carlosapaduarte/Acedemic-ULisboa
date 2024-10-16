import { Task } from "~/service/service";
import { TaskListItem } from "./TaskListItem/TaskListItem";
import { useTranslation } from "react-i18next";

export function TaskList({ tasks, onTaskClick, onTaskStatusUpdated }: {
    tasks: Task[],
    onTaskClick: ((task: Task) => void),
    onTaskStatusUpdated: (() => void)
}) {
    const { t } = useTranslation(["task"]);

    return (
        <div>
            {tasks?.map((task: Task, index: number) =>
                <TaskListItem key={index} taskToDisplay={task} onTaskClick={onTaskClick}
                              onTaskStatusUpdated={onTaskStatusUpdated} />
            )}
        </div>
    );
}