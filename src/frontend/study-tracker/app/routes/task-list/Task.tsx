import { useState } from "react";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { service, Task } from "~/service/service";
import { StatusPicker } from "./commons";
import styles from "./tasksPage.module.css";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

function Tags({ tags }: { tags: string[] }) {
    const { t } = useTranslation(["task"]);

    return (
        <div>
            <p>Tags:</p>
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

    const [checked, setChecked] = useState(false);

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
                <div aria-checked={task.data.status == "finished"} className={
                    classNames(
                        styles.checkboxAndTitleContainer
                    )
                }>
                    <button className={classNames(
                        styles.checkBox,
                        task.data.status == "finished" && styles.checked)
                    }
                            onClick={() => {
                                if (task.data.status == "finished") {
                                    onNewStatusUpdateSelect("not_finished");
                                } else {
                                    onNewStatusUpdateSelect("finished");
                                }
                            }}>
                    </button>
                    <p className={
                        classNames(
                            styles.taskTitle,
                            task.data.status == "finished" && styles.strikeThrough
                        )
                    }>
                        {task.data.title}</p>
                </div>
                {/*<p>Description: {task.data.description}</p>
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
                )}*/}
            </div>
        );
    }
}