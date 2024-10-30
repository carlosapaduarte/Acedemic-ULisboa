import { useEffect, useState } from "react";
import { service, Task } from "~/service/service";

export function useTaskList(filterUncompletedTasks: boolean) {
    const [tasks, setTasks] = useState<Task[] | undefined>(undefined);

    useEffect(() => {
        refreshTasks();
    }, []);

    function refreshTasks() {
        service.getTasks(filterUncompletedTasks)
            .then((tasksUpdated: Task[]) => {
                setTasks(tasksUpdated);
            })
            .catch((error) => {
            });
    }

    return { tasks, setTasks, refreshTasks };
}