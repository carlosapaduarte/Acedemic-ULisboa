import styles from "./tasksPage.module.css";
import { RequireAuthn } from "~/components/auth/RequireAuthn";
import { Outlet } from "@remix-run/react";
import { useTaskList } from "~/routes/tasks/useTaskList";

export default function TasksPage() {
  const { tasks, setTasks, refreshTasks } = useTaskList(false);

  return (
    <RequireAuthn>
      <div className={`${styles.tasksPage} tutorial-target-tasks-header`}>
        <Outlet context={{ tasks, setTasks, refreshTasks }} />
      </div>
    </RequireAuthn>
  );
}
