import { useOutletContext, useParams, useNavigate } from "@remix-run/react";
import { service, Task, Tag } from "~/service/service";
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
    if (!taskId) {
      return;
    }
    setTask(undefined);

    service
      .getTask(parseInt(taskId, 10))
      .then((fullTask: Task) => {
        setTask(fullTask);
      })
      .catch((error) => {
        setGlobalError(error);
      });
  }, [taskId, setGlobalError]);

  function refreshTask() {
    if (!task) {
      return;
    }
    service
      .getTask(task.id)
      .then((updatedTask: Task) => {
        setTask(updatedTask);
      })
      .catch((error) => setGlobalError(error));
  }

  function updateTaskStatus(newStatus: string) {
    if (!task) {
      return;
    }
    service
      .updateTaskStatus(task.id, newStatus)
      .then(() => {
        refreshTask();
        refreshTasks();
      })
      .catch((error) => setGlobalError(error));
  }

  function deleteTask(): Promise<void> {
    if (!task) {
      return Promise.reject(new Error("Task not found"));
    }
    return service.deleteTask(task.id);
  }

  return { task, refreshTask, updateTaskStatus, deleteTask };
}

const TitleAndCheckboxSection = memo(function TitleAndCheckboxSection({
  task,
  updateTaskStatus,
}: {
  task: Task;
  updateTaskStatus: (newStatus: string) => void;
}) {
  const { t } = useTranslation(["task"]);

  return (
    <div className={classNames(styles.checkboxAndTitleContainer)}>
      <div className={styles.mainTaskCheckbox}>
        <TaskCheckbox
          checked={task.data.status == "completed"}
          onClick={() => {
            if (task.data.status == "completed") {
              updateTaskStatus("not_completed");
            } else {
              updateTaskStatus("completed");
            }
          }}
        />
      </div>
      <h1
        className={classNames(
          styles.taskTitle,
          task.data.status == "completed" && styles.completed
        )}
      >
        {task.data.title}
      </h1>
    </div>
  );
});

const DescriptionSection = memo(function DescriptionSection({
  description,
}: {
  description: string | undefined;
}) {
  const { t } = useTranslation(["task"]);
  return (
    <div>
      {description == undefined || description == "" ? (
        <p className={styles.noDescription}>{t("task:no_description")}</p>
      ) : (
        <p className={styles.description}>{description}</p>
      )}
    </div>
  );
});

const PrioritySection = memo(function PrioritySection({
  priority,
}: {
  priority: string;
}) {
  const { t } = useTranslation(["task"]);
  return (
    <h3>
      {t(`task:priority_label`)}: {t(`task:priority_option_${priority}`)}
    </h3>
  );
});

const DeadlineSection = memo(function DeadlineSection({
  deadline,
}: {
  deadline: Date | undefined;
}) {
  const { t } = useTranslation(["task"]);
  return (
    <div>
      <h3>{t("task:deadline_label")}</h3>
      {deadline == undefined ? (
        <h4 className={styles.noDeadline}>{t("task:no_deadline")}</h4>
      ) : (
        <div>
          <h4>{new Date(deadline).toLocaleString()}</h4>
        </div>
      )}
    </div>
  );
});

const TagsSection = memo(function TagsSection({
  selectedTagIds,
  availableTags,
  isLoading,
}: {
  selectedTagIds: string[];
  availableTags: Tag[];
  isLoading: boolean;
}) {
  const { t } = useTranslation(["task"]);
  const selectedTags = !isLoading
    ? availableTags.filter((tag) => selectedTagIds.includes(tag.id.toString()))
    : [];

  console.log("DEBUG TAGS:", {
    isLoading: isLoading,
    "IDs da Tarefa (selectedTagIds)": selectedTagIds,
    "Lista de TODAS as Tags (availableTags)": availableTags,
    "Tags Selecionadas (selectedTags)": selectedTags,
  });

  //TODO: traduzir tudo
  return (
    <div>
      <h3>{t("task:tags_label")}</h3>
      {isLoading ? (
        <h4 className={styles.noTags}>
          {t("task:loading_tags", "A carregar tags...")}
        </h4>
      ) : selectedTags.length === 0 ? (
        <h4 className={styles.noTags}>{t("task:no_tags")}</h4>
      ) : (
        <div className={styles.tagsContainer}>
          {selectedTags.map((tag: Tag) => (
            <p
              key={tag.id}
              className={styles.tag}
              style={{ backgroundColor: tag.color }}
            >
              {tag.name_pt}
            </p>
          ))}
        </div>
      )}
    </div>
  );
});

const StatusSection = memo(function StatusSection({
  status,
  deadline,
}: {
  status: string;
  deadline: Date | undefined;
}) {
  const { t } = useTranslation(["task"]);

  let statusText: string;
  let statusClass = styles.statusInProgress; // Classe default

  if (status === "completed") {
    statusText = t("task:status_completed", "Completa");
    statusClass = styles.statusCompleted;
  } else if (deadline && new Date(deadline) < new Date()) {
    statusText = t("task:status_overdue", "Em atraso");
    statusClass = styles.statusOverdue;
  } else {
    statusText = t("task:status_in_progress", "Em curso");
  }

  return (
    <div className={styles.statusContainer}>
      <h3>{t("task:status_label", "Estado")}</h3>
      <p className={classNames(styles.statusBadge, statusClass)}>
        {statusText}
      </p>
    </div>
  );
});

function RenderPage() {
  const { t } = useTranslation(["task"]);
  const { taskId } = useParams();
  const { tasks, refreshTasks } = useOutletContext<{
    tasks: Task[];
    refreshTasks: () => void;
  }>();

  const navigate = useNavigate();

  const { task, refreshTask, updateTaskStatus, deleteTask } = useTask(
    tasks,
    refreshTasks,
    taskId
  );

  const [editTask, setEditTask] = useState(false);

  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const setGlobalError = useSetGlobalError();

  useEffect(() => {
    setIsLoadingTags(true);
    service
      .fetchUserTags()
      .then((tags) => {
        setAvailableTags(tags);
        setIsLoadingTags(false);
      })
      .catch((err) => {
        setGlobalError(err);
        setIsLoadingTags(false);
      });
  }, [setGlobalError]);

  const handleDeleteTask = async () => {
    if (!task) return;
    const confirmed = window.confirm(
      t(
        "task:confirm_delete_message",
        `Tens a certeza que queres apagar a tarefa "${task.data.title}"?`
      )
    );

    if (confirmed) {
      try {
        await deleteTask();
        refreshTasks();
        navigate("/tasks");
      } catch (error) {
        setGlobalError(error as Error);
      }
    }
  };

  if (!tasks) {
    return <h2>Loading task...</h2>;
  }

  if (!task) {
    return <h2>Task not found</h2>;
  }

  const taskIdNumber = taskId ? parseInt(taskId, 10) : undefined;
  if (!taskIdNumber) {
    return <h2>Task ID is not valid</h2>;
  }
  //TODO: meter aqui a seção de subtarefas

  return (
    <div className={styles.mainTaskContainer}>
      <div className={styles.headerContainer}>
        <TitleAndCheckboxSection
          task={task}
          updateTaskStatus={updateTaskStatus}
        />

        <StatusSection
          status={task.data.status}
          deadline={task.data.deadline}
        />
      </div>

      <DescriptionSection description={task.data.description} />
      <PrioritySection priority={task.data.priority} />
      <DeadlineSection deadline={task.data.deadline} />

      <TagsSection
        selectedTagIds={task.data.tags}
        availableTags={availableTags}
        isLoading={isLoadingTags}
      />

      <div className={styles.buttonContainer}>
        <EditTaskButton
          taskId={taskIdNumber}
          task={task}
          onTaskUpdated={() => {
            setEditTask(false);
            refreshTask();
          }}
        />

        <button
          className={classNames(styles.button, styles.deleteButton)}
          onClick={handleDeleteTask}
        >
          {t("task:delete_task", "Apagar Tarefa")}
        </button>
      </div>
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
