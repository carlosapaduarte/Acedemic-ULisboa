import React, { useMemo, useState } from "react";
import { service, Task } from "~/service/service";

import { Button, Dialog, DialogTrigger, Modal } from "react-aria-components";

import "./createTaskReactAriaModal.css";
import styles from "./createTask.module.css";
import classNames from "classnames";
import { CreateTaskForm } from "~/routes/tasks/CreateTask/CreateTaskForm/CreateTaskForm";
import { SecondModalContext } from "./SecondModalContext";
import { useTranslation } from "react-i18next";
import { useTags } from "~/hooks/useTags";
import { CreateTaskInputDto, SlotToWorkDto } from "~/service/output_dtos";


function useCreateNewTask() {
    const [title, setTitle] = useState<string | undefined>(undefined);
    const [description, setDescription] = useState<string | undefined>(undefined);
    const [deadline, setDeadline] = useState<Date | undefined>(undefined);
    const [priority, setPriority] = useState<string | undefined>("low");
    const { tags, appendTag, removeTag } = useTags();
    const [status, setStatus] = useState<string | undefined>(undefined);
    const [subTasks, setSubTasks] = useState<CreateTaskInputDto[]>([]);

    const [slotsToWork, setSlotsToWork] = useState<SlotToWorkDto[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    function clearFields() {
        setTitle(undefined);
        setDescription(undefined);
        setDeadline(undefined);
        setPriority("low");
        tags.forEach((tag) => removeTag(tag));
        setStatus(undefined);
        setSubTasks([]);
        setSlotsToWork([]);
        setSelectedTags([]);
    }

    function appendSubSubTask(subTask: CreateTaskInputDto) {
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
        slotsToWork,
        setSlotsToWork,
        selectedTags,
        setSelectedTags,
        subTasks,
        appendSubSubTask,
        clearFields
    };
}

const CreateTaskModal = React.memo(function CreateTaskModal({ onTaskCreated }: {
    onTaskCreated: (task: Task) => void
}) {
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
        slotsToWork,
        setSlotsToWork,
        selectedTags,
        setSelectedTags,
        appendSubSubTask,
        subTasks,
        clearFields
    } = useCreateNewTask();

    const { t } = useTranslation(["task"]);

    function createTask(newTaskInfo: CreateTaskInputDto, onDone: (task: Task) => void) {
        service.createNewTask(newTaskInfo)
            .then((task: Task) => onDone(task))
            .catch((error) => {
            }/*setGlobalError(error)*/);
    }

    function onConfirmClick(newTaskInfo: CreateTaskInputDto) {
        createTask(newTaskInfo, onTaskCreated);
    }

    const finishCreatingTaskButtonDisabled = !title || !priority;

    return (
        <Modal>
            <Dialog>{({ close }) => (
                <div className={styles.newTaskModalContainer}>
                    <Button className={classNames(styles.closeButton)} onPress={close}>
                        {t("task:close")}
                    </Button>
                    <h1 className={styles.newTaskTitleText}>
                        {t("task:new_task_title")}
                    </h1>
                    <div className={styles.newTaskFormContainer}>
                        <CreateTaskForm
                            description={description}
                            setDescription={setDescription}
                            slotsToWork={slotsToWork}
                            setSlotsToWork={setSlotsToWork}
                            deadline={deadline}
                            setDeadline={setDeadline}
                            selectedTags={selectedTags}
                            setSelectedTags={setSelectedTags}
                            title={title}
                            setTitle={setTitle}
                            priority={priority}
                            setPriority={setPriority}
                        />
                    </div>
                    <div className={styles.finishCreatingTaskButtonContainer}>
                        <Button className={classNames(styles.finishCreatingTaskButton)}
                                isDisabled={finishCreatingTaskButtonDisabled}
                                onPress={() => {
                                    if (finishCreatingTaskButtonDisabled) {
                                        return;
                                    }
                                    close();
                                    onConfirmClick({
                                        title,
                                        description,
                                        deadline,
                                        priority,
                                        tags: selectedTags,
                                        status: status ?? "not_completed",
                                        subTasks,
                                        slotsToWork
                                    });
                                    clearFields();
                                }}>
                            {t("task:create_task")}
                        </Button>
                    </div>
                </div>
            )}</Dialog>
        </Modal>
    );
});

const ModalWrapper = React.memo(function ModalWrapper(
    { onTaskCreated, children }: { onTaskCreated: (task: Task) => void, children: JSX.Element }
) {
    const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
    const [secondModalContent, setSecondModalContent] = useState<JSX.Element | undefined>(undefined);
    const [secondModalClass, setSecondModalClass] = useState<string | undefined>(undefined);

    const secondModalContextValue = useMemo(() => ({
        isSecondModalOpen,
        setIsSecondModalOpen,
        secondModalContent,
        setSecondModalContent,
        secondModalClass,
        setSecondModalClass
    }), [isSecondModalOpen, setIsSecondModalOpen, secondModalContent, setSecondModalContent, secondModalClass, setSecondModalClass]);

    return (
        <DialogTrigger>
            {children}
            <SecondModalContext.Provider value={secondModalContextValue}>
                <CreateTaskModal onTaskCreated={onTaskCreated} />
            </SecondModalContext.Provider>
            <Modal isOpen={isSecondModalOpen} onOpenChange={setIsSecondModalOpen} className={secondModalClass}>
                {secondModalContent}
            </Modal>
        </DialogTrigger>
    );
});

export function CreateTaskButton({ onTaskCreated }: { onTaskCreated: (task: Task) => void }) {
    const { t } = useTranslation(["task"]);

    return (
        <ModalWrapper onTaskCreated={onTaskCreated}>
            <Button className={classNames(styles.createNewTaskButton)}>
                + {t("task:create_new_task")}
            </Button>
        </ModalWrapper>
    );
}