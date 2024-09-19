import { useState } from "react"
import { Task } from "~/service/service"
import { TaskList, useTaskList } from "../task-list/TaskList"

export function SelectAssociatedTasks({onTasksSelected} : {onTasksSelected: (tasks: Task[]) => void}) {
    // Lists tasks and allows to select pick those tasks (except Tasks that are concluded!)
    // Operation is completed if user presses "Confirm" button

    const {tasks, refreshTasks} = useTaskList(true)
    const [associatedTasks, setAssociatedTasks] = useState<Task[]>([])

    function onTaskSelected(task: Task) {
        const newTasks = [...associatedTasks]
        newTasks.push(task)
        setAssociatedTasks(newTasks)
    }

    return tasks ?
        <div>
            <h1>Select tasks to associate!</h1>
            <TaskList tasks={tasks} onTaskClick={onTaskSelected} onTaskStatusUpdated={() => refreshTasks()} />
            <button onClick={() => onTasksSelected(associatedTasks)}>Confirm associated tasks!</button>
        </div>
        :
        <></>
}