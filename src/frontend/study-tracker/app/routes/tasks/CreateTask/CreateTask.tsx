import React, { useEffect, useMemo, useState } from "react";
import { service, Task, Tag } from "~/service/service";

import { Button, Dialog, DialogTrigger, Modal } from "react-aria-components";

import "./createTaskReactAriaModal.css";
import styles from "./createTask.module.css";
import classNames from "classnames";
import { CreateTaskForm } from "~/routes/tasks/CreateTask/CreateTaskForm/CreateTaskForm";
import { SecondModalContext } from "./SecondModalContext";
import { useTranslation } from "react-i18next";
import { CreateTaskInputDto, SlotToWorkDto } from "~/service/output_dtos";
import { EditTagModal } from "~/components/TagsModal/EditTagModal";

function useCreateNewTask() {
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState<string | undefined>(undefined);
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<string | undefined>("low");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [subTasks, setSubTasks] = useState<CreateTaskInputDto[]>([]);
  const [slotsToWork, setSlotsToWork] = useState<SlotToWorkDto[]>([]);

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
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

  function clearFields() {
    setTitle(undefined);
    setDescription(undefined);
    setDeadline(undefined);
    setPriority("low");
    setStatus(undefined);
    setSubTasks([]);
    setSlotsToWork([]);
    setSelectedTagIds([]);
    setAvailableTags([]);
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
    subTasks,
    appendSubSubTask,
    clearFields,
    selectedTagIds,
    setSelectedTagIds,
    availableTags,
    refreshTags,
    isEditTagModalOpen,
    setIsEditTagModalOpen,
  };
}

const CreateTaskModal = React.memo(function CreateTaskModal({
  onTaskCreated,
}: {
  onTaskCreated: (task: Task) => void;
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
    subTasks,
    appendSubSubTask,
    clearFields,
    selectedTagIds,
    setSelectedTagIds,
    availableTags,
    refreshTags,
    isEditTagModalOpen,
    setIsEditTagModalOpen,
  } = useCreateNewTask();

  const { t } = useTranslation();

  useEffect(() => {
    refreshTags();
  }, []);

  function createTask(
    newTaskInfo: CreateTaskInputDto,
    onDone: (task: Task) => void
  ) {
    service
      .createNewTask(newTaskInfo)
      .then((task: Task) => onDone(task))
      .catch(
        (error) => {
          console.error("Erro ao criar tarefa:", error);
        } /*setGlobalError(error)*/
      );
  }

  function onConfirmClick(newTaskInfo: CreateTaskInputDto) {
    createTask(newTaskInfo, onTaskCreated);
  }

  const finishCreatingTaskButtonDisabled = !title || !priority;

  return (
    <>
      <Modal>
        <Dialog>
          {({ close }) => (
            <div className={styles.newTaskModalContainer}>
              <Button
                className={classNames(styles.closeButton)}
                onPress={close}
              >
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
                  title={title}
                  setTitle={setTitle}
                  priority={priority}
                  setPriority={setPriority}
                  selectedTagIds={selectedTagIds}
                  setSelectedTagIds={setSelectedTagIds}
                  availableTags={availableTags}
                  refreshTags={refreshTags}
                  setIsEditTagModalOpen={setIsEditTagModalOpen}
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
                      tags: selectedTagIds,
                      status: status ?? "not_completed",
                      subTasks,
                      slotsToWork,
                    });
                    clearFields();
                  }}
                >
                  {t("task:create_task")}
                </Button>
              </div>
            </div>
          )}
        </Dialog>
      </Modal>
      <EditTagModal
        isOpen={isEditTagModalOpen}
        setIsOpen={setIsEditTagModalOpen}
        onTagsUpdate={refreshTags}
      />
    </>
  );
});

const ModalWrapper = React.memo(function ModalWrapper({
  onTaskCreated,
  children,
}: {
  onTaskCreated: (task: Task) => void;
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
        <CreateTaskModal onTaskCreated={onTaskCreated} />
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

export function CreateTaskButton({
  onTaskCreated,
}: {
  onTaskCreated: (task: Task) => void;
}) {
  const { t } = useTranslation();

  return (
    <ModalWrapper onTaskCreated={onTaskCreated}>
      <Button className={classNames(styles.createNewTaskButton)}>
        + {t("task:create_new_task")}
      </Button>
    </ModalWrapper>
  );
}
