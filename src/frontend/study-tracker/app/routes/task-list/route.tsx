import { useEffect, useState } from "react"
import { useSetError } from "~/components/error/ErrorContainer"
import { service, Task } from "~/service/service"
import { utils } from "~/utils"
import { TaskView } from "./Task"
import { CreateTaskView } from "./CreateTask"

export function useTaskList() {
    const [tasks, setTasks] = useState<Task[] | undefined>(undefined)
    const setError = useSetError()

    useEffect(() => {
        refreshTasks()
    }, [])

    function refreshTasks() {
        const userId = utils.getUserId()
        service.getTasks(userId)
            .then((tasks: Task[]) => setTasks(tasks))
            .catch((error) => setError(error))
    }

    return {tasks, refreshTasks}
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
    const {tasks, refreshTasks} = useTaskList()
    const [view, setView] = useState<TaskListView>("taskList")

    function onTaskCreated() {
        refreshTasks()
        setView("taskList")
    }

    if (view == "taskList" && tasks)
        return (
            <div>
                <button onClick={() => setView("createNewTask")}>Create New Task!</button>
                <TaskList tasks={tasks} onTaskClick={() => {}} />
            </div>
        )
    else
        return (<CreateTaskView onTaskCreated={onTaskCreated}/>)
}