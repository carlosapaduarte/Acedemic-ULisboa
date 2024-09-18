import { useEffect, useState } from "react"
import { useSetError } from "~/components/error/ErrorContainer"
import { service, Task } from "~/service/service"
import { utils } from "~/utils"
import { TaskView } from "./Task"
import { CreateTask } from "./CreateTask"

export function useTaskList() {
    const [tasks, setTasks] = useState<Task[] | undefined>(undefined)
    const setError = useSetError()

    useEffect(() => {
        const userId = utils.getUserId()
        service.getTasks(userId)
            .then((tasks: Task[]) => setTasks(tasks))
            .catch((error) => setError(error))
    }, [])

    return tasks
}

export function TaskList({tasks, onTaskClick} : {tasks: Task[], onTaskClick: (taskId: Task) => void}) {
    return (
        <div>
            <h1>My Tasks</h1>
            {tasks?.map((task: Task, index: number) => 
                <TaskView key={index} taskToDisplay={task} />
            )}
        </div>
    )
}

type TaskListView =
    | "taskList"
    | "createNewTask"

export default function TaskPage() {
    const tasks = useTaskList()
    const [view, setView] = useState<TaskListView>("taskList")

    if (view == "taskList" && tasks)
        return (
            <div>
                <button onClick={() => setView("createNewTask")}>Create New Task!</button>
                <TaskList tasks={tasks} onTaskClick={() => {}} />
            </div>
        )
    else
        return (<CreateTask onTaskCreated={() => setView("taskList")} />)
}