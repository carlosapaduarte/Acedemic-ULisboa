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
import { hasInvalidSlotRanges } from "./slotValidation";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { CreateTagModal } from "~/components/TagsModal/CreateTagModal";
import calendarStyles from "~/routes/calendar/CreateEvent/EventModal.module.css";

function useCreateNewTask() {
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState<string | undefined>(undefined);
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<string | undefined>("low");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [subTasks, setSubTasks] = useState<CreateTaskInputDto[]>([]);
  const [slotsToWork, setSlotsToWork] = useState<SlotToWorkDto[]>([]);
  const [isMicroTask, setIsMicroTask] = useState(false);

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isEditTagModalOpen, setIsEditTagModalOpen] = useState(false);
  const [isCreateTagModalOpen, setIsCreateTagModalOpen] = useState(false);

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
    setIsMicroTask(false);
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
    isCreateTagModalOpen,
    setIsCreateTagModalOpen,
    isMicroTask,
    setIsMicroTask,
  };
}

const CreateTaskModal = React.memo(function CreateTaskModal({
  onTaskCreated,
  parentTaskId,
}: {
  onTaskCreated: (task: Task) => void;
  parentTaskId?: number;
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
    isMicroTask,
    setIsMicroTask,
    isCreateTagModalOpen,
    setIsCreateTagModalOpen,
  } = useCreateNewTask();

  const { t } = useTranslation();
  const setGlobalError = useSetGlobalError();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    refreshTags();
  }, []);

  async function createTask(
    newTaskInfo: CreateTaskInputDto,
    onDone: (task: Task) => void,
    close: () => void,
  ) {
    setIsSaving(true);
    try {
      const created = await service.createNewTask(newTaskInfo);
      onDone(created);
      clearFields();
      close();
    } catch (error) {
      setGlobalError(
        error instanceof Error ? error : new Error(String(error)),
      );
    } finally {
      setIsSaving(false);
    }
  }
  // 🕵️‍♀️ Espião: Intenção de criar tarefa (abriu o modal)
  useEffect(() => {
      service.logUserAction("tracker", "intent", "open_create_task");
  }, []);

  function onConfirmClick(
    newTaskInfo: CreateTaskInputDto,
    close: () => void,
  ) {
    service.logUserAction("tracker", "action", "create_task");
    void createTask(newTaskInfo, onTaskCreated, close);
  }

  const finishCreatingTaskButtonDisabled =
    !title || !priority || hasInvalidSlotRanges(slotsToWork);

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
                {parentTaskId
                  ? t("task:new_subtask_title", "Nova Subtarefa")
                  : t("task:new_task_title")}
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
                  setIsCreateTagModalOpen={setIsCreateTagModalOpen}
                  isMicroTask={isMicroTask}
                  setIsMicroTask={setIsMicroTask}
                />
              </div>
              <div className={styles.finishCreatingTaskButtonContainer}>
                <Button
                  className={classNames(styles.finishCreatingTaskButton)}
                  isDisabled={finishCreatingTaskButtonDisabled || isSaving}
                  onPress={() => {
                    if (finishCreatingTaskButtonDisabled || isSaving) {
                      return;
                    }
                    onConfirmClick(
                      {
                        title: title!,
                        description,
                        deadline,
                        priority: priority!,
                        tags: selectedTagIds,
                        status: status ?? "not_completed",
                        subTasks,
                        slotsToWork,
                        is_micro_task: isMicroTask,
                        parent_task_id: parentTaskId,
                      },
                      close,
                    );
                  }}
                >
                  {isSaving
                    ? t("task:saving", "A guardar...")
                    : t("task:create_task")}
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
      <Modal
        isOpen={isCreateTagModalOpen}
        onOpenChange={setIsCreateTagModalOpen}
        className={calendarStyles.createTagModal} 
      >
        <Dialog aria-label="Create Tag">
          {({ close }) => (
            <CreateTagModal 
              onTagCreated={refreshTags} 
              close={close} 
            />
          )}
        </Dialog>
      </Modal>
    </>
  );
});

const ModalWrapper = React.memo(function ModalWrapper({
  onTaskCreated,
  children,
  parentTaskId,
  forceOpen,
  onClose,
}: {
  onTaskCreated: (task: Task) => void;
  children: JSX.Element;
  parentTaskId?: number;
  forceOpen?: boolean;
  onClose?: () => void;
}) {
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [secondModalContent, setSecondModalContent] = useState<
    JSX.Element | undefined
  >(undefined);
  const [secondModalClass, setSecondModalClass] = useState<string | undefined>(
    undefined
  );

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && onClose) {
      onClose();
    }
  };

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
    <DialogTrigger isOpen={isOpen} onOpenChange={handleOpenChange}>
      {children}
      <SecondModalContext.Provider value={secondModalContextValue}>
        <CreateTaskModal
          onTaskCreated={onTaskCreated}
          parentTaskId={parentTaskId}
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

export function CreateTaskButton({
  onTaskCreated,
  parentTaskId,
  forceOpen,
  onClose,
}: {
  onTaskCreated: (task: Task) => void;
  parentTaskId?: number;
  forceOpen?: boolean;
  onClose?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <ModalWrapper
      onTaskCreated={onTaskCreated}
      parentTaskId={parentTaskId}
      forceOpen={forceOpen}
      onClose={onClose}
    >
      <Button className={classNames(styles.createNewTaskButton)}>
        + {t("task:create_new_task")}
      </Button>
    </ModalWrapper>
  );
}
