import { useState } from "react";
import { Task } from "~/service/service";
import { TaskList } from "~/routes/tasks/TaskList";
import { useTranslation } from "react-i18next";
import { useTaskList } from "~/routes/tasks/useTaskList";

export function SelectAssociatedTasks({
  onTasksSelected,
}: {
  onTasksSelected: (tasks: Task[]) => void;
}) {
  // lsita as tasks não concluídas e permite que se selecione
  // sao marcadas como completas quando se para o contador ou termina o tempo

  const { t } = useTranslation(["study"]);

  const { tasks, refreshTasks } = useTaskList(true);
  const [associatedTasks, setAssociatedTasks] = useState<Task[]>([]);

  function onTaskSelected(task: Task) {
    const newTasks = [...associatedTasks];
    newTasks.push(task);
    setAssociatedTasks(newTasks);
  }

  return tasks ? (
    <div>
      <h1>{t("study:associate_tasks")}</h1>
      <TaskList
        tasks={tasks}
        onTaskClick={onTaskSelected}
        onTaskStatusUpdated={() => refreshTasks()}
      />
      <button onClick={() => onTasksSelected(associatedTasks)}>
        {t("study:confirm_associated_tasks")}
      </button>
    </div>
  ) : (
    <></>
  );
}
