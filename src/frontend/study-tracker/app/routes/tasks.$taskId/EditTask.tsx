import React, { useEffect, useMemo, useState } from "react";
import { service, Task, Tag } from "~/service/service";

import { Button, Dialog, DialogTrigger, Modal } from "react-aria-components";
import "../tasks/CreateTask/createTaskReactAriaModal.css";
import styles from "../tasks/CreateTask/createTask.module.css";
import pageStyles from "./taskPage.module.css";
import classNames from "classnames";
import { CreateTaskForm } from "~/routes/tasks/CreateTask/CreateTaskForm/CreateTaskForm";
import { useTranslation } from "react-i18next";
import { useTags } from "~/hooks/useTags";
import { CreateTaskInputDto, SlotToWorkDto } from "~/service/output_dtos";
import { SecondModalContext } from "../tasks/CreateTask/SecondModalContext";

function useEditTask(task: Task) {
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState<string | undefined>(undefined);
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<string | undefined>("low");
  //const { tags, appendTag, removeTag } = useTags();
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [subTasks, setSubTasks] = useState<CreateTaskInputDto[]>([]);

  const [slotsToWork, setSlotsToWork] = useState<SlotToWorkDto[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isEditTagModalOpen, setIsEditTagModalOpen] = useState(false);

  const refreshTags = async () => {
    try {
      const freshTags = await service.fetchUserTags();
      setAvailableTags(freshTags);
    } catch (error) {
      console.error("Falha ao buscar tags atualizadas:", error);
    }
  };

  useEffect(() => {
    if (task) {
      setTitle(task.data.title);
      setDescription(task.data.description);
      setDeadline(task.data.deadline);
      setPriority(task.data.priority);
      setStatus(task.data.status);
      /*setSubTasks(task.data.subTasks);
            setSlotsToWork(task.data.slotsToWork);*/
      setSelectedTags(task.data.tags);
      refreshTags();
    }
  }, [task]);

  function clearFields() {
    setTitle(undefined);
    setDescription(undefined);
    setDeadline(undefined);
    setPriority("low");
    setStatus(undefined);
    setSubTasks([]);
    setSlotsToWork([]);
    setSelectedTags([]);
  }

  function appendSubSubTask(subTask: CreateTaskInputDto) {
    let newSubTasks;
    if (subTasks == undefined) newSubTasks = [subTask];
    else {
      if (subTasks.includes(subTask)) return;
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
    status,
    setStatus,
    slotsToWork,
    setSlotsToWork,
    selectedTags,
    setSelectedTags,
    subTasks,
    appendSubSubTask,
    clearFields,
    availableTags,
    refreshTags,
    isEditTagModalOpen,
    setIsEditTagModalOpen,
  };
}

const EditTaskModal = React.memo(function CreateTaskModal({
  taskId,
  task,
  onTaskUpdated,
}: {
  taskId: number;
  task: Task;
  onTaskUpdated: () => void;
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
    status,
    setStatus,
    slotsToWork,
    setSlotsToWork,
    selectedTags,
    setSelectedTags,
    appendSubSubTask,
    subTasks,
    clearFields,
    availableTags,
    refreshTags,
    isEditTagModalOpen,
    setIsEditTagModalOpen,
  } = useEditTask(task);

  const { t } = useTranslation(["task"]);

  function updateTask(newTaskInfo: CreateTaskInputDto, onDone: () => void) {
    //console.log(taskId)
    service
      .updateTask(taskId, newTaskInfo, task.data.title)
      .then(() => onDone())
      .catch((error) => {} /*setGlobalError(error)*/);
  }

  function onConfirmClick(newTaskInfo: CreateTaskInputDto) {
    updateTask(newTaskInfo, onTaskUpdated);
  }

  const finishCreatingTaskButtonDisabled = !title || !priority;

  return (
    <Modal>
      <Dialog>
        {({ close }) => (
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
                selectedTagIds={selectedTags}
                setSelectedTagIds={setSelectedTags}
                availableTags={availableTags}
                refreshTags={refreshTags}
                setIsEditTagModalOpen={setIsEditTagModalOpen}
                title={title}
                setTitle={setTitle}
                priority={priority}
                setPriority={setPriority}
              />
            </div>
            <div className={styles.finishCreatingTaskButtonContainer}>
              <Button
                className={classNames(styles.finishCreatingTaskButton)}
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
                    slotsToWork,
                  });
                  clearFields();
                }}
              >
                {t("task:update_task")}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </Modal>
  );
});

const ModalWrapper = React.memo(function ModalWrapper({
  taskId,
  task,
  onTaskUpdated,
  children,
}: {
  taskId: number;
  task: Task;
  onTaskUpdated: () => void;
  children: JSX.Element;
}) {
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [secondModalContent, setSecondModalContent] = useState<
    JSX.Element | undefined
  >(undefined);
  const [secondModalClass, setSecondModalClass] = useState<string | undefined>(
    undefined
  );

  const secondModalContextValue = useMemo(
    () => ({
      isSecondModalOpen,
      setIsSecondModalOpen,
      secondModalContent,
      setSecondModalContent,
      secondModalClass,
      setSecondModalClass,
    }),
    [
      isSecondModalOpen,
      setIsSecondModalOpen,
      secondModalContent,
      setSecondModalContent,
      secondModalClass,
      setSecondModalClass,
    ]
  );

  return (
    <DialogTrigger>
      {children}
      <SecondModalContext.Provider value={secondModalContextValue}>
        <EditTaskModal
          task={task}
          taskId={taskId}
          onTaskUpdated={onTaskUpdated}
        />
      </SecondModalContext.Provider>
      <Modal
        isOpen={isSecondModalOpen}
        onOpenChange={setIsSecondModalOpen}
        className={secondModalClass}
      >
        {secondModalContent}
      </Modal>
    </DialogTrigger>
  );
});

export function EditTaskButton({
  taskId,
  task,
  onTaskUpdated,
}: {
  taskId: number;
  task: Task;
  onTaskUpdated: () => void;
}) {
  const { t } = useTranslation(["task"]);

  return (
    <ModalWrapper taskId={taskId} task={task} onTaskUpdated={onTaskUpdated}>
      <Button className={classNames(pageStyles.button)}>
        {t("task:update_task")}
      </Button>
    </ModalWrapper>
  );
}
