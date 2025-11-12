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

function formatEventTime(date: Date): string {
  return new Date(date).toLocaleTimeString(navigator.language, {
    hour: "2-digit",
    minute: "2-digit",
  });
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
function useAssociatedTasks(showMicroTasks: boolean) {
  const { t } = useTranslation("task");

  const { tasks: availableTasks, refreshTasks } = useTaskList(true);

  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);

  const [tasksForToday, otherTasks] = React.useMemo(() => {
    if (!availableTasks) return [[], []];

    const today: Task[] = [];
    const others: Task[] = [];

    for (const task of availableTasks) {
      if (!showMicroTasks && task.data.is_micro_task) {
        continue;
      }

      if (isDateToday(task.data.deadline)) {
        today.push(task);
      } else {
        others.push(task);
      }
    }
    return [today, others];
  }, [availableTasks, showMicroTasks]);

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

function useUpcomingEvents() {
  const [todayEvents, setTodayEvents] = useState<Event[]>([]);
  const [futureEvents, setFutureEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const setGlobalError = useSetGlobalError();

  useEffect(() => {
    service
      .getAllUserEvents()
      .then((eventsList) => {
        const now = new Date();
        const today: Event[] = [];
        const future: Event[] = [];

        // Separa os eventos em duas listas
        for (const event of eventsList) {
          const eventEndDate = new Date(event.endDate);
          // Só queremos eventos que ainda não acabaram
          if (eventEndDate >= now) {
            if (isDateToday(event.startDate)) {
              today.push(event);
            } else {
              future.push(event);
            }
          }
        }

        // Ordena ambos pela data de início
        const sortFn = (a: Event, b: Event) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime();

        setTodayEvents(today.sort(sortFn));
        setFutureEvents(future.sort(sortFn));
      })
      .catch(setGlobalError)
      .finally(() => setIsLoading(false));
  }, [setGlobalError]);

  return { todayEvents, futureEvents, isLoading };
}

// mostra a lista de tarefas
function AssociatedTaskListView({
  tasksForToday,
  otherTasks,
  selectedTaskIds,
  onTaskClick,
  showMicroTasks,
  onToggleMicroTasks,
}: {
  tasksForToday: Task[];
  otherTasks: Task[];
  selectedTaskIds: number[];
  onTaskClick: (task: Task) => void;
  showMicroTasks: boolean;
  onToggleMicroTasks: () => void;
}) {
  const { t } = useTranslation(["task"]);

  return (
    <div className={styles.taskListContainer}>
      <label className={styles.microTaskToggle}>
        <TaskCheckbox
          checked={showMicroTasks}
          onClick={onToggleMicroTasks}
          className={styles.modalCheckbox}
        />
        {t("task:show_micro_tasks", "Incluir micro-tarefas")}
      </label>

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

function TodayEventsList({
  todayEvents,
  futureEvents,
  isLoading,
}: {
  todayEvents: Event[];
  futureEvents: Event[];
  isLoading: boolean;
}) {
  const { t } = useTranslation(["study", "task"]);

  const renderList = (list: Event[]) => {
    if (list.length === 0) {
      return (
        <p className={styles.noEventsText}>
          {t("study:no_events_in_list", "Sem eventos.")}
        </p>
      );
    }
    return (
      <ul className={styles.eventList}>
        {list.map((event) => (
          <li key={event.id} className={styles.eventItem}>
            <span className={styles.eventTime}>
              {formatEventTime(event.startDate)} -{" "}
              {formatEventTime(event.endDate)}
            </span>
            <span
              className={styles.eventTitle}
              style={{ borderLeftColor: event.color || "var(--color-2)" }}
            >
              {event.title}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={styles.eventsContainer}>
      <h2 className={styles.taskListTitle}>
        {t("study:todays_events", "EVENTOS DE HOJE")}
      </h2>
      {isLoading ? (
        <p className={styles.noEventsText}>
          {t("task:loading", "A carregar...")}
        </p>
      ) : (
        renderList(todayEvents)
      )}

      <h2 className={classNames(styles.taskListTitle, styles.otherTasksTitle)}>
        {t("study:upcoming_events", "PRÓXIMOS EVENTOS")}
      </h2>
      {isLoading ? (
        <p className={styles.noEventsText}>
          {t("task:loading", "A carregar...")}
        </p>
      ) : (
        renderList(futureEvents)
      )}
    </div>
  );
}

function TimerView({
  happeningStudyBlock,
  timerStopDate,
  onTimeSelected,
  studyStopDate,
  onStopClick,
  onTimerFinish,
  markTimerStart,
}: {
  happeningStudyBlock: Event | undefined;
  // (Props de useTimerSetup)
  timerStopDate: Date | undefined;
  onTimeSelected: (studyStopDate: Date, pauseStopDate: Date) => void;
  studyStopDate: Date | undefined;
  onStopClick: () => void;
  onTimerFinish: () => void;
  markTimerStart: () => void;
}) {
  const { t } = useTranslation("study");

  // Se não há um evento a decorrer E não há um temporizador definido:
  if (!happeningStudyBlock && !timerStopDate) {
    return (
      <div className={styles.pomodoroContainer}>
        <SelectTime onTimeSelected={onTimeSelected} />
      </div>
    );
  }

  // Se há um evento a decorrer:
  let title = t("study:study_time", "Tempo de Estudo");
  let stopDate = timerStopDate;

  if (happeningStudyBlock) {
    stopDate = happeningStudyBlock.endDate;
    title =
      happeningStudyBlock.title +
      (studyStopDate
        ? t("study:study_time", " (Tempo de Estudo)")
        : t("study:pause_time", " (Pausa)"));
  } else if (!studyStopDate) {
    // Se não há evento E não é tempo de estudo, é pausa
    title = t("study:pause_time", "Pausa");
  }

  return (
    <div className={styles.pomodoroContainer}>
      <Timer
        title={title}
        stopDate={stopDate!} // Sabemos que uma destas datas está definida
        onStart={markTimerStart}
        onStopClick={onStopClick}
        onFinish={onTimerFinish}
      />
    </div>
  );
}
function TimerAndAssociatedTasksView() {
  const { t } = useTranslation("study");
  const setGlobalError = useSetGlobalError();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [tasksToConfirm, setTasksToConfirm] = useState<Task[]>([]);
  const [showMicroTasks, setShowMicroTasks] = useState(true);

  const {
    tasksForToday,
    otherTasks,
    selectedTaskIds,
    toggleTaskSelection,
    refreshTasks,
    setSelectedTaskIds,
  } = useAssociatedTasks(showMicroTasks);

  const [happeningStudyBlock, setHappeningStudyBlock] = useState<
    Event | undefined
  >();
  const [isLoadingBlock, setIsLoadingBlock] = useState(true);

  const {
    todayEvents,
    futureEvents,
    isLoading: isLoadingEvents,
  } = useUpcomingEvents();

  // 2. Lógica do Modal
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

  useEffect(() => {
    service
      .getStudyBlockHappeningNow()
      .then((event: Event | undefined) => setHappeningStudyBlock(event))
      .catch((error) => setGlobalError(error))
      .finally(() => setIsLoadingBlock(false));
  }, [setGlobalError]);

  if (isLoadingBlock) {
    return <div>A carregar...</div>; // O 'loading' principal
  }

  return (
    <>
      <div className={styles.pomodoroLayout}>
        {(timerStopDate || happeningStudyBlock) && (
          <TodayEventsList
            todayEvents={todayEvents}
            futureEvents={futureEvents}
            isLoading={isLoadingEvents}
          />
        )}

        <TimerView
          happeningStudyBlock={happeningStudyBlock}
          timerStopDate={timerStopDate}
          onTimeSelected={onTimeSelected}
          studyStopDate={studyStopDate}
          onStopClick={onStopClick}
          onTimerFinish={onTimerFinish}
          markTimerStart={markTimerStart}
        />

        {(timerStopDate || happeningStudyBlock) && (
          <AssociatedTaskListView
            tasksForToday={tasksForToday}
            otherTasks={otherTasks}
            selectedTaskIds={selectedTaskIds}
            onTaskClick={toggleTaskSelection}
            showMicroTasks={showMicroTasks}
            onToggleMicroTasks={() => setShowMicroTasks((prev) => !prev)}
          />
        )}
      </div>

      {/* O Modal (continua a funcionar) */}
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
