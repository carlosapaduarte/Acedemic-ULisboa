import { service, Task } from "~/service/service";
import { TaskView } from "./Task";
import { useEffect, useState } from "react";
import { useSetError } from "~/components/error/ErrorContainer";
import { utils } from "~/utils";

export function useTaskList(filterUncompletedTasks: boolean) {
    const [tasks, setTasks] = useState<Task[] | undefined>(undefined)
    const setError = useSetError()

    useEffect(() => {
        refreshTasks()
    }, [])

    function refreshTasks() {
        const userId = utils.getUserId()
        service.getTasks(userId, filterUncompletedTasks)
            .then((tasksUpdated: Task[]) => setTasks(tasksUpdated))
            .catch((error) => setError(error))
    }

    return {tasks, refreshTasks}
}

export function TaskList({tasks, onTaskClick, onTaskStatusUpdated = undefined} : {tasks: Task[], onTaskClick: ((taskId: Task) => void) | undefined, onTaskStatusUpdated: (() => void) | undefined }) {
    return (
        <div>
            <h1>My Tasks</h1>
            {tasks?.map((task: Task, index: number) => 
                <div key={index}>
                    {onTaskClick ?
                        <button onClick={() => onTaskClick(task)}>Select Me!</button>
                        :
                        <></>
                    }
                    <TaskView taskToDisplay={task} onTaskStatusUpdated={onTaskStatusUpdated} />
                </div>
            )}
        </div>
    )
}