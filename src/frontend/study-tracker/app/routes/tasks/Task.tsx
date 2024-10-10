import { useState } from "react";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { service, Task } from "~/service/service";
import styles from "./tasksPage.module.css";
import classNames from "classnames";


function useTaskView(taskToCache: Task) {
    const setError = useSetGlobalError();
    const [task, setTask] = useState<Task>(taskToCache);

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

    return { task, updateTask, updateTaskStatus };
}

// "TaskView" name is because there already exists a Task type in this project
export function TaskView({ taskToDisplay, onTaskStatusUpdated = undefined }: {
    taskToDisplay: Task,
    onTaskStatusUpdated: (() => void) | undefined
}) {
    // This function received a "onTaskStatusUpdated()" handler because, sometimes, it's handy for the caller to know that one of the tasks was updated!

    const {
        task,
        updateTask,
        updateTaskStatus
    } = useTaskView(taskToDisplay);

    const [checked, setChecked] = useState(false);

    function passedDeadline(): boolean {
        return task.data.deadline < new Date();
    }

    function onNewStatusUpdateSelect(newStatus: string) {
        updateTaskStatus(newStatus, () => {
            updateTask();
            onTaskStatusUpdated ? onTaskStatusUpdated() : {};
        });
    }


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