import React, { useEffect, useState } from "react";
import { SelectTime } from "./TimeSelection";
import { Timer } from "./Timer";
import { Event, service, Task } from "~/service/service";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { TaskList } from "~/routes/tasks/TaskList";
import { RequireAuthn } from "~/components/auth/RequireAuthn";
import styles from "./pomodoroPage.module.css";
import { useTranslation } from "react-i18next";
import { useTaskList } from "~/routes/tasks/useTaskList";

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
    availableTasks: availableTasks || [],
    selectedTaskIds,
    toggleTaskSelection,
    completeSelectedTasks,
  };
}

// mostra a lista de tarefas
function AssociatedTaskListView({
  availableTasks,
  selectedTaskIds,
  onTaskClick,
}: {
  availableTasks: Task[];
  selectedTaskIds: number[];
  onTaskClick: (task: Task) => void;
}) {
  const { t } = useTranslation(["task"]);

  return (
    <div className={styles.taskListContainer}>
      <h2 className={styles.taskListTitle}>{t("task:available_tasks")}</h2>
      <TaskList
        tasks={availableTasks}
        onTaskClick={() => {}}
        onTaskStatusUpdated={() => {}}
        selectedTaskIds={selectedTaskIds}
        onSelectionToggle={onTaskClick}
      />
    </div>
  );
}

function SetupAndStartTimer({
  availableTasks,
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
  availableTasks: Task[];
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
          availableTasks={availableTasks}
          selectedTaskIds={selectedTaskIds}
          onTaskClick={onTaskClick}
        />
      )}
    </div>
  );
}

function StartTimerByStudyBlock({
  availableTasks,
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
  availableTasks: Task[];
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
          availableTasks={availableTasks}
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

  const {
    availableTasks,
    selectedTaskIds,
    toggleTaskSelection,
    completeSelectedTasks,
  } = useAssociatedTasks();

  const {
    timerStopDate,
    onTimeSelected,
    studyStopDate,
    onStopClick,
    onTimerFinish,
    markTimerStart,
  } = useTimerSetup(completeSelectedTasks);

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

  if (happeningStudyBlock == undefined) {
    return (
      <SetupAndStartTimer
        availableTasks={availableTasks}
        selectedTaskIds={selectedTaskIds}
        onTaskClick={toggleTaskSelection}
        onSessionEnd={completeSelectedTasks}
        timerStopDate={timerStopDate}
        onTimeSelected={onTimeSelected}
        studyStopDate={studyStopDate}
        onStopClick={onStopClick}
        onTimerFinish={onTimerFinish}
        markTimerStart={markTimerStart}
      />
    );
  } else {
    return (
      <StartTimerByStudyBlock
        availableTasks={availableTasks}
        selectedTaskIds={selectedTaskIds}
        onTaskClick={toggleTaskSelection}
        onSessionEnd={completeSelectedTasks}
        happeningStudyBlock={happeningStudyBlock}
        timerStopDate={timerStopDate}
        studyStopDate={studyStopDate}
        onStopClick={onStopClick}
        onTimerFinish={onTimerFinish}
        markTimerStart={markTimerStart}
      />
    );
  }
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
