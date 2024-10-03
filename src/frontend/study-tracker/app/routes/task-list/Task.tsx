import { useState } from "react";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { service, Task } from "~/service/service";
import { utils } from "~/utils";
import { StatusPicker } from "./commons";
import { useTranslation } from "react-i18next";

function Tags({ tags }: { tags: string[] }) {
    const { t } = useTranslation(["task"]);
    
    return (
        <div>
            <p>
                {t("task:select_me")}
                Tags:
            </p>
            {tags.map((tag: string, index: number) =>
                <p key={index}>{tag}</p>
            )}
        </div>
    );
}

type View =
    | "taskView"
    | "changeStatus"

function useTaskView(taskToCache: Task) {
    const setError = useSetGlobalError();
    const [view, setView] = useState<View>("taskView");
    const [task, setTask] = useState<Task>(taskToCache);

    function selectUpdateStatusView() {
        setView("changeStatus");
    }

    function selectTaskView() {
        setView("taskView");
    }

    function updateTask() {
        service.getTask(task.id)
            .then((updatedTask: Task) => setTask(updatedTask))
            .catch((error) => setError(error));
    }

    function updateTaskStatus(newStatus: string, onDone: () => void) {
        service.updateTaskStatus(task.id, newStatus)
            .then(() => onDone())
            .catch((error) => setError(error));
    }

    return { view, task, selectUpdateStatusView, selectTaskView, updateTask, updateTaskStatus };
}

// "TaskView" name is because there already exists a Task type in this project
export function TaskView({ taskToDisplay, onTaskStatusUpdated = undefined }: {
    taskToDisplay: Task,
    onTaskStatusUpdated: (() => void) | undefined
}) {
    // This function received a "onTaskStatusUpdated()" handler because, sometimes, it's handy for the caller to know that one of the tasks was updated!

    const {
        view,
        task,
        selectUpdateStatusView,
        selectTaskView,
        updateTask,
        updateTaskStatus
    } = useTaskView(taskToDisplay);

    function passedDeadline(): boolean {
        return task.data.deadline < new Date();
    }

    function onNewStatusUpdateSelect(newStatus: string) {
        updateTaskStatus(newStatus, () => {
            selectTaskView();
            updateTask();
            onTaskStatusUpdated ? onTaskStatusUpdated() : {};
        });
    }

    if (view == "changeStatus") {
        return (
            <div>
                <StatusPicker onStatusSelect={onNewStatusUpdateSelect} />
                <br /><br />
            </div>
        );
    } else {
        return (
            <div>
                <button onClick={selectUpdateStatusView}>
                    Change Status
                </button>
                <p>Id: {task.id}</p>
                <p>Title: {task.data.title}</p>
                <p>Description: {task.data.description}</p>
                {passedDeadline() ?
                    <p>Passed Deadline!!!</p>
                    :
                    <></>
                }
                <p>Deadline: {task.data.deadline.getTime()}</p>
                <Tags tags={task.data.tags} />
                <p>Priority: {task.data.priority}</p>
                <p>Status: {task.data.status}</p>
                <br />
                <h2>Sub Tasks:</h2>
                {task.subTasks.map((subTask: Task, index: number) =>
                    <div key={index}>
                        <TaskView taskToDisplay={subTask} onTaskStatusUpdated={undefined} />
                        <br />
                    </div>
                )}
            </div>
        );
    }
}