import { useState } from "react"
import { TaskList, useTaskList } from "../task-list/route"
import { Task } from "~/service/service"

export function SelectAssociatedTasks({onTasksSelected} : {onTasksSelected: (tasks: Task[]) => void}) {
    const tasks = useTaskList()
    const [associatedTasks, setAssociatedTasks] = useState<Task[]>([])

    function onTaskSelected(task: Task) {
        if (tasks) {
            const newTasks = [...tasks]
            newTasks.push(task)
            setAssociatedTasks(newTasks)
        }
        else
            setAssociatedTasks([task])
    }

    return tasks ?
        <div>
            <h1>Select tasks to associate</h1>
            <TaskList tasks={tasks} onTaskClick={onTaskSelected} />
            <button onClick={() => onTasksSelected(associatedTasks)}>Confirm!</button>
        </div>
        :
        <></>
}