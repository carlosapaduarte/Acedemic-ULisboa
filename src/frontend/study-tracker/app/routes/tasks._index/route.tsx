import { useTranslation } from "react-i18next";
import { TaskList } from "~/routes/tasks/TaskList";
import { CreateTaskButton } from "~/routes/tasks/CreateTask/CreateTask";
import { useNavigate, useOutletContext } from "@remix-run/react";
import { Task } from "~/service/service";
import styles from "./taskListPage.module.css";
import { useState, useMemo } from "react";
import { FaFilter } from "react-icons/fa6";
import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  type Selection,
} from "react-aria-components";

export default function TasksPage() {
  const { t } = useTranslation(["task"]);
  const navigate = useNavigate();

  const { tasks, setTasks, refreshTasks } = useOutletContext<{
    tasks: Task[];
    setTasks: (tasks: Task[] | ((prevTasks: Task[]) => Task[])) => void;
    refreshTasks: () => void;
  }>();

  const [filterMode, setFilterMode] = useState<Selection>(new Set(["all"]));

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];

    const mode = Array.from(filterMode)[0];

    return tasks.filter((task) => {
      const isMicro = task.data.is_micro_task;

      if (mode === "hide_micro") {
        return !isMicro;
      }
      if (mode === "only_micro") {
        return isMicro;
      }
      return true;
    });
  }, [tasks, filterMode]);

  function onTaskCreated() {
    refreshTasks();
  }

  if (!tasks) return <div>{t("task:loading")}</div>;

  return (
    <div className={styles.taskListPage}>
      <div className={styles.header}>
        <h1 className={styles.tasksListTitle}>
          {t("task:my_tasks_list_title", "As minhas tarefas")}
        </h1>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <MenuTrigger>
            <Button
              aria-label={t("task:filter_tasks", "Filtrar")}
              className={styles.filterButton}
            >
              <FaFilter size={18} />
            </Button>
            <Popover className={styles.filterPopover} placement="bottom end">
              <Menu
                className={styles.filterMenu}
                selectionMode="single"
                selectedKeys={filterMode}
                onSelectionChange={setFilterMode}
                disallowEmptySelection
              >
                <MenuItem id="all" className={styles.filterMenuItem}>
                  {t("task:filter_show_all", "Mostrar Todas")}
                </MenuItem>
                <MenuItem id="hide_micro" className={styles.filterMenuItem}>
                  {t("task:filter_hide_micro", "Esconder Relâmpago")}
                </MenuItem>
                <MenuItem id="only_micro" className={styles.filterMenuItem}>
                  {t("task:filter_only_micro", "Só Relâmpago")}
                </MenuItem>
              </Menu>
            </Popover>
          </MenuTrigger>

          <CreateTaskButton onTaskCreated={onTaskCreated} />
        </div>
      </div>

      <div className={styles.taskListContainer}>
        <TaskList
          tasks={filteredTasks}
          onTaskClick={(task: Task) => {
            if (!task.data.is_micro_task) {
              navigate(`/tasks/${task.id}`);
            }
          }}
          onTaskStatusUpdated={(updatedTask) => {
            refreshTasks();
          }}
        />
      </div>
    </div>
  );
}
