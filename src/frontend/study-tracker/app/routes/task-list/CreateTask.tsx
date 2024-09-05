import { CategoryAndTagsPicker, useTags } from "~/routes/commons"
import { CreateSubTask } from "./CreateSubTask"
import { StatusPicker } from "./commons"
import { utils } from "~/utils"
import { ChangeEvent, useState } from "react"
import { service, SubTask, Task } from "~/service/service"
import { useSetError } from "~/components/error/ErrorContainer"

const priorityValues: string[] = [
    "urgente",
    "importante"
]

function PriorityPicker({onPrioritySelect} : {onPrioritySelect: (priority: string) => void}) {
    return (
        <div>
            <h1>Select Priority:</h1>
            {priorityValues.map((priority: string, index: number) => 
                <div key={index}>
                    <button onClick={() => onPrioritySelect(priority)}>
                        {priority}
                    </button>
                </div>
            )}
        </div>
    )
}

function useCreateNewTask() {
    const setError = useSetError()

    const [title, setTitle] = useState<string | undefined>(undefined)
    const [description, setDescription] = useState<string | undefined>(undefined)
    const [deadline, setDeadline] = useState<Date | undefined>(undefined)
    const [priority, setPriority] = useState<string | undefined>(undefined)
    const {tags, appendTag} = useTags()
    const [status, setStatus] = useState<string | undefined>(undefined)
    const [subTasks, setSubTasks] = useState<SubTask[]>([])
    const [createEvent, setCreateEvent] = useState<boolean>(false)

    function createTask(task: Task, createEvent: boolean, onDone: () => void) {
        const userId = utils.getUserId()
        service.createNewTask(userId, task, createEvent)
            .then(() => onDone())
            .catch((error) => setError(error))
    }

    function appendSubSubTask(subTask: SubTask) {
        let newSubTasks
        if (subTasks == undefined)
            newSubTasks = [subTask]
        else {
            if (subTasks.includes(subTask))
                return
            newSubTasks = [...subTasks]
            newSubTasks.push(subTask)
        }
        setSubTasks(newSubTasks)
    }

    function toggleCreateEvent() {
        if (createEvent)
            setCreateEvent(false)
        else
            setCreateEvent(true)
    }

    return {
        title, 
        setTitle, 
        description, 
        setDescription, 
        deadline, 
        setDeadline, 
        priority, 
        setPriority, 
        tags, 
        appendTag, 
        status,
        setStatus,
        subTasks,
        createEvent,
        toggleCreateEvent,
        appendSubSubTask,
        createTask
    }
}

export function CreateTask({onTaskCreated} : {onTaskCreated: () => void}) {
    const {
        title, 
        setTitle, 
        description, 
        setDescription, 
        deadline, 
        setDeadline, 
        priority, 
        setPriority, 
        tags, 
        appendTag, 
        status,
        setStatus,
        appendSubSubTask,
        subTasks,
        createEvent,
        toggleCreateEvent,
        createTask
    } = useCreateNewTask()
    
    const [displaySubTaskForm, setDisplaySubTaskForm] = useState<boolean>(false)

    const todayStr = utils.toInputDateValueStr(new Date())

    function onEndDateChangeHandler(e: ChangeEvent<HTMLInputElement>) {
        const selectedEndDate = new Date(e.target.value)
        setDeadline(selectedEndDate)
    }

    let deadlineFieldValue;
    if (deadline)
        deadlineFieldValue = utils.toInputDateValueStr(deadline)
    else
        deadlineFieldValue = todayStr

    return (
        <div>
            <h1>Create Task:</h1>
            <label>Title: </label> <input value={title ? title : ""} onChange={e => setTitle(e.target.value)} />
            <label>Description: </label> <input value={description ? description : ""} onChange={e => setDescription(e.target.value)} />
            <label>Deadline: </label>
            <input
                type="datetime-local"
                value={deadlineFieldValue}
                min={todayStr}
                onChange={onEndDateChangeHandler}
            />
            <PriorityPicker onPrioritySelect={setPriority} />
            <CategoryAndTagsPicker onTagClick={appendTag}/>
            <StatusPicker onStatusSelect={setStatus} />

            <br/><br/>
            
            {!displaySubTaskForm ? 
                <button  onClick={() => setDisplaySubTaskForm(true)}>
                    Add Sub Task
                </button>
                :
                <></>
            }
            
            {displaySubTaskForm ?
                <CreateSubTask onConfirm={appendSubSubTask} />
                :
                <></>
            }

            <input type="checkbox" onChange={() => toggleCreateEvent()}/>

            {title && description && deadline && priority && tags && status && subTasks ?
                <button onClick={() => createTask({title, description, deadline, priority, tags, status, subTasks}, createEvent, onTaskCreated)}>
                    Confirm!
                </button>
                :
                <></>
            }
        </div>
    )
}