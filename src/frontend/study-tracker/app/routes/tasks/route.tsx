import styles from "./tasksPage.module.css";
import { RequireAuthn } from "~/components/auth/RequireAuthn";
import { Outlet } from "@remix-run/react";
import { useTaskList } from "~/routes/tasks/useTaskList";

export default function TasksPage() {
    const { tasks, refreshTasks } = useTaskList(false);

    return (
        <RequireAuthn>
            <div className={styles.tasksPage}>
                <Outlet context={{ tasks, refreshTasks }} />
            </div>
        </RequireAuthn>
    );
}