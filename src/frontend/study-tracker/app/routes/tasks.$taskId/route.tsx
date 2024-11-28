import { useOutletContext, useParams } from "@remix-run/react";
import { service, Task } from "~/service/service";
import { useTranslation } from "react-i18next";
import styles from "./taskPage.module.css";
import classNames from "classnames";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import React, { memo, useEffect, useState } from "react";
import { TaskList } from "~/routes/tasks/TaskList";
import { TaskCheckbox } from "~/components/Checkbox/TaskCheckbox";
import { EditTaskButton } from "./EditTask";

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
            .then((updatedTask: Task) => {
                //console.log(updatedTask)
                setTask(updatedTask)
            })
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

    //console.log(task.data.status)

    return (
        <div className={classNames(styles.checkboxAndTitleContainer)}>
            <div className={styles.mainTaskCheckbox}>
                <TaskCheckbox checked={task.data.status == "completed"}
                              onClick={() => {
                                  if (task.data.status == "completed") {
                                      updateTaskStatus("not_completed");
                                  } else {
                                      updateTaskStatus("completed");
                                  }
                              }} />
            </div>
            <h1 className={classNames(
                styles.taskTitle,
                task.data.status == "completed" && styles.completed
            )}>
                {task.data.title}
            </h1>
            {/*<button className={styles.editButton}>
                <img src="icons/edit_icon.svg" alt="Edit Icon" />
            </button>*/}
        </div>
    );
});

const DescriptionSection = memo(function DescriptionSection({ description }: { description: string | undefined }) {
    const { t } = useTranslation(["task"]);

    return (
        <div>
            {
                description == undefined || description == ""
                    ? <p className={styles.noDescription}>{t("task:no_description")}</p>
                    : <p className={styles.description}>{description}</p>
            }
        </div>
    );
});

const PrioritySection = memo(function PrioritySection({ priority }: { priority: string }) {
    const { t } = useTranslation(["task"]);

    return (
        <h3>{t(`task:priority_label`)}: {t(`task:priority_option_${priority}`)}</h3>
    );
});

const DeadlineSection = memo(function DeadlineSection({ deadline }: { deadline: Date | undefined }) {
    const { t } = useTranslation(["task"]);

    return (
        <div>
            <h3>{t("task:deadline_label")}</h3>
            {
                deadline == undefined
                    ? <h4 className={styles.noDeadline}>{t("task:no_deadline")}</h4>
                    : <div>
                        <h4>{deadline.toLocaleString()}</h4>
                    </div>
            }
        </div>
    );
});

const TagsSection = memo(function TagsSection({ tags }: { tags: string[] }) {
    const { t } = useTranslation(["task"]);

    return (
        <div>
            <h3>{t("task:tags_label")}</h3>
            {
                tags.length == 0 ?
                    <h4 className={styles.noTags}>{t("task:no_tags")}</h4>
                    :
                    tags.map((tag: string, index: number) =>
                        <p key={index} className={styles.tag}>{tag}</p>
                    )
            }
        </div>
    );
});

const SubTasksSection = memo(function SubTasksSection({ subTasks }: { subTasks: Task[] }) {
    const { t } = useTranslation(["task"]);

    return (
        <div>
            <h3>{t("task:subtasks_label")}</h3>
            {
                subTasks.length == 0 ?
                    <h4 className={styles.noSubtasks}>{t("task:no_subtasks")}</h4>
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
    
    const [editTask, setEditTask] = useState(false)
    
    if (!tasks) {
        return <h2>Loading task...</h2>;
    }

    if (!task) {
        return <h2>Task not found</h2>;
    }

    const taskIdNumber = taskId ? parseInt(taskId, 10) : undefined
    if (!taskIdNumber) {
        return <h2>Task ID is not valid</h2>;
    }
    
    return (
        <div className={styles.mainTaskContainer}>
            <TitleAndCheckboxSection task={task} updateTaskStatus={updateTaskStatus} />
            <DescriptionSection description={task.data.description} />
            <PrioritySection priority={task.data.priority} />
            <DeadlineSection deadline={task.data.deadline} />
            <TagsSection tags={task.data.tags} />
            <SubTasksSection subTasks={task.subTasks} />
            <EditTaskButton taskId={taskIdNumber} task={task} onTaskUpdated={() => {
                setEditTask(false)
                refreshTask()
            }} />
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