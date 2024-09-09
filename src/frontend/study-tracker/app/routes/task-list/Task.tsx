import { useState } from "react"
import { useSetError } from "~/components/error/ErrorContainer"
import { service, Task } from "~/service/service"
import { utils } from "~/utils"
import { StatusPicker } from "./commons"

function Tags({tags} : {tags: string[]}) {
    return (
        <div>
            <p>Tags:</p>
            {tags.map((tag: string, index: number) => 
                <p key={index}>{tag}</p>
            )}
        </div>
    )
}

type View =
    | "taskView"
    | "changeStatus"

function useTaskView(taskToCache: Task) {
    const setError = useSetError()
    const [view, setView] = useState<View>("taskView")
    const [task, setTask] = useState<Task>(taskToCache)

    function selectUpdateStatusView() {
        setView("changeStatus")
    }

    function selectTaskView() {
        setView("taskView")
    }

    function updateTask() {
        const userId = utils.getUserId()
        service.getTask(userId, task.id)
            .then((updatedTask: Task) => setTask(updatedTask))
            .catch((error) => setError(error))
    }
    
    function updateTaskStatus(newStatus: string, onDone: () => void) {
        const userId = utils.getUserId()
        service.updateTaskStatus(userId, task.id, newStatus)
            .then(() => onDone())
            .catch((error) => setError(error))
    }

    return {view, task, selectUpdateStatusView, selectTaskView, updateTask, updateTaskStatus}
}

// "TaskView" name is because there already exists a Task type in this project
export function TaskView({taskToDisplay} : {taskToDisplay: Task}) {
    const {view, task, selectUpdateStatusView, selectTaskView, updateTask, updateTaskStatus} = useTaskView(taskToDisplay)

    function passedDeadline(): boolean {
        return task.data.deadline < new Date()
    }

    function onNewStatusUpdateSelect(newStatus: string) {
        updateTaskStatus(newStatus, () => {
            selectTaskView()
            updateTask()
        })
    }

    if (view == "changeStatus") {
        return (
            <div>
                <StatusPicker onStatusSelect={onNewStatusUpdateSelect}/>
                <br/><br/>
            </div>
        )
    }
    else {
        return (
            <div>
                <button onClick={selectUpdateStatusView}>
                    Change Status
                </button>
                <p>Id: {task.id}</p>
                <p>Title: {task.data.title}</p>
                <p>Description: {task.data.description}</p>
                {passedDeadline() ?
                    <p>Passed Deadline!!!</p>
                    :
                    <></>
                }
                <p>Deadline: {task.data.deadline.getTime()}</p>
                <Tags tags={task.data.tags} />
                <p>Priority: {task.data.priority}</p>
                <p>Status: {task.data.status}</p>
                <br/>
                <h1>Sub Tasks:</h1>
                {task.subTasks.map((subTask: Task, index: number) => 
                    <div key={index}>
                        <TaskView taskToDisplay={subTask} />
                        <br/>
                    </div>
                )}
            </div>
        )
    }
}