import React, { useEffect, useState } from "react";
import { SelectTime } from "./TimeSelection";
import { Timer } from "./Timer";
import { Event, service, Task } from "~/service/service";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { TaskList } from "~/routes/tasks/TaskList";
import { RequireAuthn } from "~/components/auth/RequireAuthn";
import styles from "./pomodoroPage.module.css";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { useTaskList } from "~/routes/tasks/useTaskList";
import { Modal, Dialog, DialogTrigger, Button } from "react-aria-components";
import { TaskCheckbox } from "~/components/Checkbox/TaskCheckbox";

function isDateToday(date: Date | undefined): boolean {
  if (!date) return false;
  const d = new Date(date);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

export let handle = {
  i18n: ["task", "study"],
};
//gere o estado do temporizador
function useTimerSetup(onSessionEnd: () => void) {
  const setError = useSetGlobalError();
  const [studyStopDate, setStudyStopDate] = useState<Date | undefined>(
    undefined
  );
  const [pauseStopDate, setPauseStopDate] = useState<Date | undefined>(
    undefined
  );
  const [timerStopDate, setTimerStopDate] = useState<Date | undefined>(
    undefined
  );

  function onTimeSelected(studyStopDate: Date, pauseStopDate: Date) {
    setStudyStopDate(studyStopDate);
    setPauseStopDate(pauseStopDate);
    setTimerStopDate(studyStopDate);
  }

  function onStopClick() {
    service.finishStudySession().catch((error) => setError(error));
    onSessionEnd();
    setTimerStopDate(undefined);
  }

  function onTimerFinish() {
    if (timerStopDate === studyStopDate) {
      onSessionEnd();
      setTimerStopDate(pauseStopDate);
    } else {
      setTimerStopDate(undefined);
    }
  }

  function markTimerStart() {
    service.startStudySession().catch((error) => setError(error));
  }

  return {
    timerStopDate,
    onTimeSelected,
    studyStopDate,
    onStopClick,
    onTimerFinish,
    markTimerStart,
  };
}

//gere a lógica das tarefas
function useAssociatedTasks() {
  const { t } = useTranslation("task");

  const { tasks: availableTasks, refreshTasks } = useTaskList(true);

  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);

  const [tasksForToday, otherTasks] = React.useMemo(() => {
    if (!availableTasks) return [[], []];

    const today: Task[] = [];
    const others: Task[] = [];

    for (const task of availableTasks) {
      if (isDateToday(task.data.deadline)) {
        today.push(task);
      } else {
        others.push(task);
      }
    }
    return [today, others];
  }, [availableTasks]);

  function toggleTaskSelection(task: Task) {
    setSelectedTaskIds((prevIds) => {
      if (prevIds.includes(task.id)) {
        return prevIds.filter((id) => id !== task.id);
      } else {
        return [...prevIds, task.id];
      }
    });
  }

  function completeSelectedTasks() {
    const tasksToComplete = selectedTaskIds.map((id) =>
      service.updateTaskStatus(id, "completed")
    );

    Promise.all(tasksToComplete)
      .then(() => {
        refreshTasks();
        setSelectedTaskIds([]);
      })
      .catch((err) => {
        console.error("Erro ao completar tarefas", err);
      });
  }

  return {
    tasksForToday,
    otherTasks,
    selectedTaskIds,
    toggleTaskSelection,
    completeSelectedTasks,
    refreshTasks,
    setSelectedTaskIds,
  };
}

// mostra a lista de tarefas
function AssociatedTaskListView({
  tasksForToday,
  otherTasks,
  selectedTaskIds,
  onTaskClick,
}: {
  tasksForToday: Task[];
  otherTasks: Task[];
  selectedTaskIds: number[];
  onTaskClick: (task: Task) => void;
}) {
  const { t } = useTranslation(["task"]);

  return (
    <div className={styles.taskListContainer}>
      <h2 className={styles.taskListTitle}>
        {t("task:tasks_for_today", "Tarefas para Hoje")}
      </h2>
      <TaskList
        tasks={tasksForToday}
        onTaskClick={() => {}}
        onTaskStatusUpdated={() => {}}
        selectedTaskIds={selectedTaskIds}
        onSelectionToggle={onTaskClick}
      />

      <h2 className={classNames(styles.taskListTitle, styles.otherTasksTitle)}>
        {t("task:other_tasks", "Outras Tarefas")}
      </h2>
      <TaskList
        tasks={otherTasks}
        onTaskClick={() => {}}
        onTaskStatusUpdated={() => {}}
        selectedTaskIds={selectedTaskIds}
        onSelectionToggle={onTaskClick}
      />
    </div>
  );
}

function ConfirmationModalContent({
  tasks,
  onCancel,
  onConfirm,
}: {
  tasks: Task[];
  onCancel: () => void;
  onConfirm: (completedTaskIds: number[]) => void;
}) {
  const { t } = useTranslation(["task"]);

  const [checkedIds, setCheckedIds] = useState<number[]>([]);

  useEffect(() => {
    setCheckedIds(tasks.map((task) => task.id));
  }, [tasks]);

  function handleToggle(taskId: number) {
    setCheckedIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  }

  return (
    <Dialog className={styles.pomodoroDialog}>
      <h3 className={styles.modalTitle}>
        {t("task:pomodoro_complete_title", "Sessão Terminada")}
      </h3>
      <p>
        {t("task:pomodoro_multi_q", "Quais das seguintes tarefas concluíste?")}
      </p>

      <div className={styles.modalTaskList}>
        {tasks.map((task) => (
          <label key={task.id} className={styles.modalTaskItem}>
            <TaskCheckbox
              checked={checkedIds.includes(task.id)}
              onClick={() => handleToggle(task.id)}
              className={styles.modalCheckbox}
            />
            {task.data.title}
          </label>
        ))}
      </div>

      <div className={styles.modalButtonContainer}>
        <Button className={styles.modalButtonSecondary} onPress={onCancel}>
          {t("task:cancel", "Cancelar")}
        </Button>
        <Button
          className={styles.modalButtonPrimary}
          style={{ color: "var(--text-color-2)" }}
          onPress={() => onConfirm(checkedIds)}
        >
          {t("task:confirm", "Confirmar")}
        </Button>
      </div>
    </Dialog>
  );
}

function SetupAndStartTimer({
  tasksForToday,
  otherTasks,
  selectedTaskIds,
  onTaskClick,
  onSessionEnd,
  // Props do timer vindas do pai
  timerStopDate,
  onTimeSelected,
  studyStopDate,
  onStopClick,
  onTimerFinish,
  markTimerStart,
}: {
  tasksForToday: Task[];
  otherTasks: Task[];
  selectedTaskIds: number[];
  onTaskClick: (task: Task) => void;
  onSessionEnd: () => void;
  timerStopDate: Date | undefined;
  onTimeSelected: (studyStopDate: Date, pauseStopDate: Date) => void;
  studyStopDate: Date | undefined;
  onStopClick: () => void;
  onTimerFinish: () => void;
  markTimerStart: () => void;
}) {
  const { t } = useTranslation("study");

  if (timerStopDate == undefined) {
    return (
      <div className={styles.pomodoroLayout}>
        <SelectTime onTimeSelected={onTimeSelected} />
      </div>
    );
  }

  const title = studyStopDate
    ? t("study:study_time", "Tempo de Estudo")
    : t("study:pause_time", "Pausa");
  return (
    <div className={styles.pomodoroLayout}>
      <Timer
        title={title}
        stopDate={timerStopDate}
        onStart={markTimerStart}
        onStopClick={onStopClick}
        onFinish={onTimerFinish}
      />

      {studyStopDate && (
        <AssociatedTaskListView
          tasksForToday={tasksForToday}
          otherTasks={otherTasks}
          selectedTaskIds={selectedTaskIds}
          onTaskClick={onTaskClick}
        />
      )}
    </div>
  );
}

function StartTimerByStudyBlock({
  tasksForToday,
  otherTasks,
  selectedTaskIds,
  onTaskClick,
  onSessionEnd,
  happeningStudyBlock,
  timerStopDate,
  studyStopDate,
  onStopClick,
  onTimerFinish,
  markTimerStart,
}: {
  tasksForToday: Task[];
  otherTasks: Task[];
  selectedTaskIds: number[];
  onTaskClick: (task: Task) => void;
  onSessionEnd: () => void;
  happeningStudyBlock: Event;
  timerStopDate: Date | undefined;
  studyStopDate: Date | undefined;
  onStopClick: () => void;
  onTimerFinish: () => void;
  markTimerStart: () => void;
}) {
  const { t } = useTranslation("study");

  const timerTitleMsg =
    happeningStudyBlock.title +
    (studyStopDate
      ? t("study:study_time", " (Tempo de Estudo)")
      : t("study:pause_time", " (Pausa)"));

  return (
    <div className={styles.pomodoroLayout}>
      {" "}
      <Timer
        title={timerTitleMsg}
        stopDate={happeningStudyBlock.endDate}
        onStart={markTimerStart}
        onStopClick={onStopClick}
        onFinish={onTimerFinish}
      />
      {studyStopDate && (
        <AssociatedTaskListView
          tasksForToday={tasksForToday}
          otherTasks={otherTasks}
          selectedTaskIds={selectedTaskIds}
          onTaskClick={onTaskClick}
        />
      )}
    </div>
  );
}

function TimerAndAssociatedTasksView() {
  const { t } = useTranslation("study");
  const setGlobalError = useSetGlobalError();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [tasksToConfirm, setTasksToConfirm] = useState<Task[]>([]);

  const {
    tasksForToday,
    otherTasks,
    selectedTaskIds,
    toggleTaskSelection,
    refreshTasks,
    setSelectedTaskIds,
  } = useAssociatedTasks();

  const openConfirmationModal = () => {
    if (selectedTaskIds.length > 0) {
      const allTasks = [...tasksForToday, ...otherTasks];
      const selected = allTasks.filter((t) => selectedTaskIds.includes(t.id));

      setTasksToConfirm(selected);
      setIsConfirmModalOpen(true);
    }
  };

  const handleConfirmCompletion = (completedTaskIds: number[]) => {
    setIsConfirmModalOpen(false);

    if (completedTaskIds.length === 0) {
      setSelectedTaskIds([]);
      return;
    }

    const tasksToComplete = completedTaskIds.map((id) =>
      service.updateTaskStatus(id, "completed")
    );

    Promise.all(tasksToComplete)
      .then(() => {
        refreshTasks();
        setSelectedTaskIds([]);
      })
      .catch((err) => {
        console.error("Erro ao completar tarefas", err);
        refreshTasks();
        setSelectedTaskIds([]);
      });
  };

  const {
    timerStopDate,
    onTimeSelected,
    studyStopDate,
    onStopClick,
    onTimerFinish,
    markTimerStart,
  } = useTimerSetup(openConfirmationModal);

  const [happeningStudyBlock, setHappeningStudyBlock] = useState<
    Event | undefined
  >();
  const [isLoadingBlock, setIsLoadingBlock] = useState(true);

  useEffect(() => {
    service
      .getStudyBlockHappeningNow()
      .then((event: Event | undefined) => setHappeningStudyBlock(event))
      .catch((error) => setGlobalError(error))
      .finally(() => setIsLoadingBlock(false));
  }, [setGlobalError]);

  if (isLoadingBlock) {
    return <div>A carregar...</div>;
  }

  return (
    <>
      {happeningStudyBlock == undefined ? (
        <SetupAndStartTimer
          tasksForToday={tasksForToday}
          otherTasks={otherTasks}
          selectedTaskIds={selectedTaskIds}
          onTaskClick={toggleTaskSelection}
          onSessionEnd={openConfirmationModal}
          timerStopDate={timerStopDate}
          onTimeSelected={onTimeSelected}
          studyStopDate={studyStopDate}
          onStopClick={onStopClick}
          onTimerFinish={onTimerFinish}
          markTimerStart={markTimerStart}
        />
      ) : (
        <StartTimerByStudyBlock
          tasksForToday={tasksForToday}
          otherTasks={otherTasks}
          selectedTaskIds={selectedTaskIds}
          onTaskClick={toggleTaskSelection}
          onSessionEnd={openConfirmationModal}
          happeningStudyBlock={happeningStudyBlock}
          timerStopDate={timerStopDate}
          studyStopDate={studyStopDate}
          onStopClick={onStopClick}
          onTimerFinish={onTimerFinish}
          markTimerStart={markTimerStart}
        />
      )}

      <Modal
        isOpen={isConfirmModalOpen}
        onOpenChange={setIsConfirmModalOpen}
        isDismissable={false}
        className={styles.pomodoroOverlay}
      >
        <ConfirmationModalContent
          tasks={tasksToConfirm}
          onCancel={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmCompletion}
        />
      </Modal>
    </>
  );
}

function StudyPage() {
  return <TimerAndAssociatedTasksView />;
}

export default function StudyPageAuthControlled() {
  return (
    <RequireAuthn>
      <StudyPage />
    </RequireAuthn>
  );
}
