import { useEffect, useState } from "react"
import { useSetError } from "~/components/error/ErrorContainer"
import { service, Task } from "~/service/service"
import { utils } from "~/utils"
import { TaskView } from "./Task"
import { CreateTask } from "./CreateTask"

function useTaskList() {
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

function TaskList({tasks, onNewTaskViewClick} : {tasks: Task[], onNewTaskViewClick: () => void}) {
    return (
        <div>
            <button onClick={() => onNewTaskViewClick()}>Create New Task!</button>
            <br/><br/>
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
        return (<TaskList tasks={tasks} onNewTaskViewClick={() => setView("createNewTask")} />)
    else
        return (<CreateTask onTaskCreated={() => setView("taskList")} />)
}