import React, { useMemo, useState } from "react";
import { service, Task } from "~/service/service";

import { Button, Dialog, DialogTrigger, Modal } from "react-aria-components";

import "../tasks/CreateTask/createTaskReactAriaModal.css";
import styles from "../tasks/CreateTask/createTask.module.css";
import classNames from "classnames";
import { CreateTaskForm } from "~/routes/tasks/CreateTask/CreateTaskForm/CreateTaskForm";
import { useTranslation } from "react-i18next";
import { useTags } from "~/hooks/useTags";
import { CreateTaskInputDto, SlotToWorkDto } from "~/service/output_dtos";
import { SecondModalContext } from "../tasks/CreateTask/SecondModalContext";


function useEditTask() {
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

const EditTaskModal = React.memo(function CreateTaskModal({ taskId, onTaskUpdated }: {
    taskId: number,
    onTaskUpdated: () => void
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
    } = useEditTask();

    const { t } = useTranslation(["task"]);

    function updateTask(newTaskInfo: CreateTaskInputDto, onDone: () => void) {
        //console.log(taskId)
        service.updateTask(taskId, newTaskInfo)
            .then(() => onDone())
            .catch((error) => {
            }/*setGlobalError(error)*/);
    }

    function onConfirmClick(newTaskInfo: CreateTaskInputDto) {
        updateTask(newTaskInfo, onTaskUpdated);
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
                        {t("task:edit_task_title")}
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
                            {t("task:update_task")}
                        </Button>
                    </div>
                </div>
            )}</Dialog>
        </Modal>
    );
});

const ModalWrapper = React.memo(function ModalWrapper(
    { taskId, onTaskUpdated, children }: { taskId: number, onTaskUpdated: () => void, children: JSX.Element }
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
                <EditTaskModal taskId={taskId} onTaskUpdated={onTaskUpdated} />
            </SecondModalContext.Provider>
            <Modal isOpen={isSecondModalOpen} onOpenChange={setIsSecondModalOpen} className={secondModalClass}>
                {secondModalContent}
            </Modal>
        </DialogTrigger>
    );
});

export function EditTaskButton({ taskId, onTaskUpdated }: { taskId: number, onTaskUpdated: () => void }) {
    const { t } = useTranslation(["task"]);

    return (
        <ModalWrapper taskId={taskId} onTaskUpdated={onTaskUpdated}>
            <Button className={classNames(styles.createNewTaskButton)}>
                {t("task:update_task")}
            </Button>
        </ModalWrapper>
    );
}