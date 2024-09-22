import { CategoryAndTagsPicker, useTags } from "~/routes/commons";
import { StatusPicker } from "./commons";
import { utils } from "~/utils";
import { ChangeEvent, useState } from "react";
import { CreateTask, service, Task } from "~/service/service";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import styles from "./tasksPage.module.css";

const priorityValues: string[] = [
    "urgente",
    "importante"
];

function PriorityPicker({ onPrioritySelect }: { onPrioritySelect: (priority: string) => void }) {
    return (
        <div>
            <h1 className={styles.createTaskTitle}>Select Priority:</h1>
            {priorityValues.map((priority: string, index: number) =>
                <div key={index}>
                    <input type={"radio"} name={"priority"} id={`priority_${index}`}
                           onChange={() => onPrioritySelect(priority)} />
                    <label htmlFor={`priority_${index}`} className={styles.priorityLabel}>{priority}</label>
                </div>
            )}
        </div>
    );
}

function useCreateNewTask() {
    const [title, setTitle] = useState<string | undefined>(undefined);
    const [description, setDescription] = useState<string | undefined>(undefined);
    const [deadline, setDeadline] = useState<Date | undefined>(undefined);
    const [priority, setPriority] = useState<string | undefined>(undefined);
    const { tags, appendTag, removeTag } = useTags();
    const [status, setStatus] = useState<string | undefined>(undefined);
    const [subTasks, setSubTasks] = useState<CreateTask[]>([]);
    const [createEvent, setCreateEvent] = useState<boolean>(false);

    function appendSubSubTask(subTask: CreateTask) {
        let newSubTasks;
        if (subTasks == undefined)
            newSubTasks = [subTask];
        else {
            if (subTasks.includes(subTask))
                return;
            newSubTasks = [...subTasks];
            newSubTasks.push(subTask);
        }
        setSubTasks(newSubTasks);
    }

    function toggleCreateEvent() {
        if (createEvent)
            setCreateEvent(false);
        else
            setCreateEvent(true);
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
        removeTag,
        status,
        setStatus,
        subTasks,
        createEvent,
        toggleCreateEvent,
        appendSubSubTask
    };
}

export function CreateTaskForm({ onConfirmClick }: { onConfirmClick: (newTaskInfo: CreateTask) => void }) {
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
        removeTag,
        status,
        setStatus,
        appendSubSubTask,
        subTasks,
        createEvent,
        toggleCreateEvent
    } = useCreateNewTask();

    const [displaySubTaskForm, setDisplaySubTaskForm] = useState<boolean>(false);

    const todayStr = utils.toInputDateValueStr(new Date());

    function onEndDateChangeHandler(e: ChangeEvent<HTMLInputElement>) {
        const selectedEndDate = new Date(e.target.value);
        setDeadline(selectedEndDate);
    }

    function onSubTaskConfirmClick(subTask: CreateTask) {
        appendSubSubTask(subTask);
        setDisplaySubTaskForm(false);
    }

    let deadlineFieldValue;
    if (deadline)
        deadlineFieldValue = utils.toInputDateValueStr(deadline);
    else
        deadlineFieldValue = todayStr;

    return (
        <div>
            <h1 className={styles.createTaskTitle}>Create Task:</h1>
            <label htmlFor={"task_title_field"}>Title: </label>
            <input value={title ? title : ""} id={"task_title_field"}
                   onChange={e => setTitle(e.target.value)} />
            <label htmlFor={"task_description_field"}>Description: </label>
            <input value={description ? description : ""} id={"task_description_field"}
                   onChange={e => setDescription(e.target.value)} />
            <label htmlFor={"task_deadline_field"}>Deadline: </label>
            <input
                type="datetime-local"
                value={deadlineFieldValue}
                min={todayStr}
                id={"task_deadline_field"}
                onChange={onEndDateChangeHandler}
            />
            <PriorityPicker onPrioritySelect={setPriority} />
            <br />
            <CategoryAndTagsPicker tags={tags} removeTag={removeTag} appendTag={appendTag} />
            <StatusPicker onStatusSelect={setStatus} />

            <label>Create associated Event</label>
            <input type="checkbox" onChange={() => toggleCreateEvent()} />

            <br /><br />

            {!displaySubTaskForm ?
                <button onClick={() => setDisplaySubTaskForm(true)}>
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
                    taskData: { title, description, deadline, priority, tags, status },
                    subTasks,
                    createEvent
                })}>
                    Confirm!
                </button>
                :
                <></>
            }
        </div>
    );
}

export function CreateTaskView({ onTaskCreated }: { onTaskCreated: (task: Task) => void }) {
    const setError = useSetGlobalError();

    function createTask(newTaskInfo: CreateTask, onDone: (task: Task) => void) {
        const userId = utils.getUserId();
        service.createNewTask(userId, newTaskInfo)
            .then((task: Task) => onDone(task))
            .catch((error) => setError(error));
    }

    function onConfirmClick(newTaskInfo: CreateTask) {
        createTask(newTaskInfo, onTaskCreated);
    }

    return (
        <CreateTaskForm onConfirmClick={onConfirmClick} />
    );
}