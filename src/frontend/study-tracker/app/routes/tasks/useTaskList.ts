import { useEffect, useState } from "react";
import { service, Task } from "~/service/service";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";

export function useTaskList(filterUncompletedTasks: boolean) {
    const [tasks, setTasks] = useState<Task[] | undefined>(undefined);
    const setError = useSetGlobalError();

    useEffect(() => {
        refreshTasks();
    }, []);

    function refreshTasks() {
        service.getTasks(filterUncompletedTasks)
            .then((tasksUpdated: Task[]) => setTasks(tasksUpdated))
            .catch((error) => setError(error));
    }

    return { tasks, refreshTasks };
}