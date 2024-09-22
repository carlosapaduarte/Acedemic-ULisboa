import { useState } from "react";
import { CreateTaskView } from "./CreateTask";
import { TaskList, useTaskList } from "./TaskList";
import styles from "./tasksPage.module.css";
import { RequireAuthn } from "~/components/auth/RequireAuthn";

type TaskListView =
    | "taskList"
    | "createNewTask"

function RenderPage() {
    const { tasks, refreshTasks } = useTaskList(false);
    const [view, setView] = useState<TaskListView>("taskList");

    function onTaskCreated() {
        refreshTasks();
        setView("taskList");
    }

    if (view == "taskList" && !tasks)
        return <div>Loading...</div>;

    if (view == "taskList" && tasks)
        return (
            <div>
                <button onClick={() => setView("createNewTask")}>Create New Task!</button>
                <TaskList tasks={tasks} onTaskClick={undefined} onTaskStatusUpdated={undefined} />
            </div>
        );
    else
        return (<CreateTaskView onTaskCreated={onTaskCreated} />);
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