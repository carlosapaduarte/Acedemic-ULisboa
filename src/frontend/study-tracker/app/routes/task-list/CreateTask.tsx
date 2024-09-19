import { CategoryAndTagsPicker, useTags } from "~/routes/commons"
import { StatusPicker } from "./commons"
import { utils } from "~/utils"
import { ChangeEvent, useState } from "react"
import { service, CreateTask, TaskData, Task } from "~/service/service"
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
    const [title, setTitle] = useState<string | undefined>(undefined)
    const [description, setDescription] = useState<string | undefined>(undefined)
    const [deadline, setDeadline] = useState<Date | undefined>(undefined)
    const [priority, setPriority] = useState<string | undefined>(undefined)
    const {tags, appendTag} = useTags()
    const [status, setStatus] = useState<string | undefined>(undefined)
    const [subTasks, setSubTasks] = useState<CreateTask[]>([])
    const [createEvent, setCreateEvent] = useState<boolean>(false)

    function appendSubSubTask(subTask: CreateTask) {
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
        appendSubSubTask
    }
}

export function CreateTaskForm({onConfirmClick} : {onConfirmClick: (newTaskInfo: CreateTask) => void}) {
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
        toggleCreateEvent
    } = useCreateNewTask()
    
    const [displaySubTaskForm, setDisplaySubTaskForm] = useState<boolean>(false)

    const todayStr = utils.toInputDateValueStr(new Date())

    function onEndDateChangeHandler(e: ChangeEvent<HTMLInputElement>) {
        const selectedEndDate = new Date(e.target.value)
        setDeadline(selectedEndDate)
    }

    function onSubTaskConfirmClick(subTask: CreateTask) {
        appendSubSubTask(subTask)
        setDisplaySubTaskForm(false)
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
            <br/>
            <CategoryAndTagsPicker onTagClick={appendTag}/>
            <StatusPicker onStatusSelect={setStatus} />

            <label>Create associated Event</label>
            <input type="checkbox" onChange={() => toggleCreateEvent()}/>

            <br/><br/>
            
            {!displaySubTaskForm ? 
                <button  onClick={() => setDisplaySubTaskForm(true)}>
                    Add Sub Task
                </button>
                :
                <></>
            }
            
            {displaySubTaskForm ?
                <CreateTaskForm onConfirmClick={onSubTaskConfirmClick} />
                :
                <></>
            }

            {title && description && deadline && priority && tags && status && subTasks ?
                <button onClick={() => onConfirmClick({
                    taskData: {title, description, deadline, priority, tags, status},
                    subTasks, 
                    createEvent
                })}>
                    Confirm!
                </button>
                :
                <></>
            }
        </div>
    )
}

export function CreateTaskView({onTaskCreated} : {onTaskCreated: (task: Task) => void}) {
    const setError = useSetError()
    
    function createTask(newTaskInfo: CreateTask, onDone: (task: Task) => void) {
        const userId = utils.getUserId()
        service.createNewTask(userId, newTaskInfo)
            .then((task: Task) => onDone(task))
            .catch((error) => setError(error))
    }

    function onConfirmClick(newTaskInfo: CreateTask) {
        createTask(newTaskInfo, onTaskCreated)
    }

    return (
        <CreateTaskForm onConfirmClick={onConfirmClick} />
    )
}