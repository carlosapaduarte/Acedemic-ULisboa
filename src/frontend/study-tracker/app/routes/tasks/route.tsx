import { useEffect } from "react";
import styles from "./tasksPage.module.css";
import { RequireAuthn } from "~/components/auth/RequireAuthn";
import { Outlet } from "@remix-run/react";
import { useTaskList } from "~/routes/tasks/useTaskList";
import { service } from "~/service/service"; // Import do espião

export default function TasksPage() {
  const { tasks, setTasks, refreshTasks } = useTaskList(false);

  // 🕵️‍♀️ Espião: Página das Tarefas
  useEffect(() => {
      service.logUserAction("tracker", "page_view", "tasks_list");
  }, []);

  return (
    <RequireAuthn>
      <div className={`${styles.tasksPage} tutorial-target-tasks-header`}>
        <Outlet context={{ tasks, setTasks, refreshTasks }} />
      </div>
    </RequireAuthn>
  );
}