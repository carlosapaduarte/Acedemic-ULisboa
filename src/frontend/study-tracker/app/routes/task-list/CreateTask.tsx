import { CategoryAndTagsPicker, useTags } from "~/routes/commons";
import { StatusPicker } from "./commons";
import { utils } from "~/utils";
import { ChangeEvent, useState } from "react";
import { CreateTask, service, Task } from "~/service/service";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import styles from "./tasksPage.module.css";
import { useTranslation } from "react-i18next";

const priorityValues: string[] = [
    "urgente",
    "importante"
];

function PriorityPicker({ onPrioritySelect }: { onPrioritySelect: (priority: string) => void }) {
    const { t } = useTranslation(["task"]);
    
    return (
        <div>
            <h1 className={styles.createTaskTitle}>
                {t("task:priority_picker_title")}
            </h1>
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
    const { t } = useTranslation(["task"]);

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
            <h1 className={styles.createTaskTitle}>
                {t("task:create_task_title")}
            </h1>
            <label htmlFor={"task_title_field"}>
                {t("task:title_label")}
            </label>
            <input value={title ? title : ""} id={"task_title_field"}
                   onChange={e => setTitle(e.target.value)} />
            <label htmlFor={"task_description_field"}>
                {t("task:description_label")}
            </label>
            <input value={description ? description : ""} id={"task_description_field"}
                   onChange={e => setDescription(e.target.value)} />
            <label htmlFor={"task_deadline_field"}>
                {t("task:deadline_label")}
            </label>
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

            <label>
                {t("task:create_event_label")}
            </label>
            <input type="checkbox" onChange={() => toggleCreateEvent()} />

            <br /><br />

            {!displaySubTaskForm ?
                <button onClick={() => setDisplaySubTaskForm(true)}>
                    {t("task:add_sub_task")}
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
                    {t("task:confirm")}
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
        service.createNewTask(newTaskInfo)
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