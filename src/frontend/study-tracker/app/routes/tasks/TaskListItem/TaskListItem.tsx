import React, { useState } from "react";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { service, Task } from "~/service/service";
import styles from "./taskListItem.module.css";
import classNames from "classnames";
import { TaskCheckbox } from "~/components/Checkbox/TaskCheckbox";


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

export function TaskListItem({ taskToDisplay, onTaskClick, onTaskStatusUpdated }: {
    taskToDisplay: Task,
    onTaskClick: (task: Task) => void,
    onTaskStatusUpdated: () => void
}) {
    // This function received a "onTaskStatusUpdated()" handler because, sometimes, it's handy for the caller to know that one of the tasks was updated!

    const {
        task,
        updateTask,
        updateTaskStatus
    } = useTaskView(taskToDisplay);

    const [checked, setChecked] = useState(false);

    function passedDeadline(): boolean {
        if (task.data.deadline == undefined)
            return false;

        return task.data.deadline < new Date();
    }

    function onNewStatusUpdateSelect(newStatus: string) {
        updateTaskStatus(newStatus, () => {
            updateTask();
            onTaskStatusUpdated();
        });
    }


    return (
        <div aria-checked={task.data.status == "finished"} className={styles.checkboxAndTitleContainer}>
            <div className={styles.checkboxContainer}>
                <TaskCheckbox checked={task.data.status == "finished"}
                              onClick={() => {
                                  if (task.data.status == "finished") {
                                      onNewStatusUpdateSelect("not_finished");
                                  } else {
                                      onNewStatusUpdateSelect("finished");
                                  }
                              }}
                              className={styles.listCheckbox}
                />
            </div>
            <button className={classNames(
                styles.taskTitleContainer,
                task.data.status == "finished" && styles.strikeThrough
            )}
                    onClick={() => onTaskClick(task)}>
                <p className={classNames(
                    styles.taskTitle,
                    task.data.status == "finished" && styles.strikeThrough
                )}>
                    {task.data.title}
                </p>
            </button>
        </div>
    );
}