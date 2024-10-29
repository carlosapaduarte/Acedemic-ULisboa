import { useOutletContext, useParams } from "@remix-run/react";
import { service, Task } from "~/service/service";
import { useTranslation } from "react-i18next";
import styles from "./taskPage.module.css";
import classNames from "classnames";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import React, { memo, useEffect, useState } from "react";
import { TaskList } from "~/routes/tasks/TaskList";
import { TaskCheckbox } from "~/components/Checkbox/TaskCheckbox";

function useTask(
    tasks: Task[] | undefined,
    refreshTasks: () => void,
    taskId: string | undefined
) {
    const setGlobalError = useSetGlobalError();
    const [task, setTask] = useState<Task | undefined>(undefined);

    useEffect(() => {
        if (!tasks || !taskId) {
            return;
        }
        setTask(tasks.find(t => t.id.toString() === taskId));
    }, [tasks, taskId]);

    function refreshTask() {
        if (!task) {
            return;
        }
        service.getTask(task.id)
            .then((updatedTask: Task) => setTask(updatedTask))
            .catch((error) => setGlobalError(error));
    }

    function updateTaskStatus(newStatus: string) {
        if (!task) {
            return;
        }
        service.updateTaskStatus(task.id, newStatus)
            .then(() => {
                refreshTask();
                refreshTasks();
            })
            .catch((error) => setGlobalError(error));
    }

    return { task, refreshTask, updateTaskStatus };
}

const TitleAndCheckboxSection = memo(function TitleAndCheckboxSection(
    {
        task,
        updateTaskStatus
    }: {
        task: Task,
        updateTaskStatus: (newStatus: string) => void
    }) {
    const { t } = useTranslation(["task"]);

    return (
        <div className={classNames(styles.checkboxAndTitleContainer)}>
            <div className={styles.mainTaskCheckbox}>
                <TaskCheckbox checked={task.data.status == "finished"}
                              onClick={() => {
                                  if (task.data.status == "finished") {
                                      updateTaskStatus("not_finished");
                                  } else {
                                      updateTaskStatus("finished");
                                  }
                              }} />
            </div>
            <h1 className={classNames(
                styles.taskTitle,
                task.data.status == "finished" && styles.finished
            )}>
                {task.data.title}
            </h1>
            <button className={styles.editButton}>
                <img src="/icons/edit_icon.svg" alt="Edit Icon" />
            </button>
        </div>
    );
});

const DescriptionSection = memo(function DescriptionSection({ description }: { description: string | undefined }) {
    return (
        <div>
        {
                description == undefined || description == ""
                    ? <p className={styles.noDescription}>No description...</p>
                    : <p className={styles.description}>{description}</p>
            }
        </div>
    );
});

const PrioritySection = memo(function PrioritySection({ priority }: { priority: string }) {
    return (
        <h3>Priority: {priority}</h3>
    );
});

const DeadlineSection = memo(function DeadlineSection({ deadline }: { deadline: Date | undefined }) {
    return (
        <div>
            {
                deadline == undefined
                    ? <h3 className={styles.noDeadline}>No deadline...</h3>
                    : <div>
                        <h3>Deadline</h3>
                        <h4>{deadline.toLocaleString()}</h4>
                    </div>
            }
        </div>
    );
});

const TagsSection = memo(function TagsSection({ tags }: { tags: string[] }) {
    return (
        <div>
            <h3>Tags</h3>
            {
                tags.length == 0 ?
                    <h4 className={styles.noTags}>No tags...</h4>
                    :
                    tags.map((tag: string, index: number) =>
                        <p key={index} className={styles.tag}>{tag}</p>
                    )
            }
        </div>
    );
});

const SubTasksSection = memo(function SubTasksSection({ subTasks }: { subTasks: Task[] }) {
    return (
        <div>
            <h3>Subtasks</h3>
            {
                subTasks.length == 0 ?
                    <h4 className={styles.noSubtasks}>No subtasks...</h4>
                    :
                    <TaskList tasks={subTasks}
                              onTaskClick={() => {
                              }}
                              onTaskStatusUpdated={() => {
                              }}
                    />
            }
        </div>
    );
});

function RenderPage() {
    const { t } = useTranslation(["task"]);

    const { taskId } = useParams();
    const { tasks, refreshTasks } = useOutletContext<{ tasks: Task[], refreshTasks: () => void }>();

    const {
        task,
        refreshTask,
        updateTaskStatus
    } = useTask(tasks, refreshTasks, taskId);

    if (!tasks) {
        return <h2>Loading task...</h2>;
    }

    if (!task) {
        return <h2>Task not found</h2>;
    }

    return (
        <div className={styles.mainTaskContainer}>
            <TitleAndCheckboxSection task={task} updateTaskStatus={updateTaskStatus} />
            <DescriptionSection description={task.data.description} />
            <PrioritySection priority={task.data.priority} />
            <DeadlineSection deadline={task.data.deadline} />
            <TagsSection tags={task.data.tags} />
            <SubTasksSection subTasks={task.subTasks} />
        </div>
    );
}

export default function TaskPage() {
    const { t } = useTranslation(["task"]);

    return (
        <div className={styles.taskPage}>
            <RenderPage />
        </div>
    );
}