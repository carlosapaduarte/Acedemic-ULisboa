import React, { useEffect, useState } from "react";
import { SelectTime } from "./TimeSelection";
import { Timer } from "./Timer";
import { Event, service, Task, Tag } from "~/service/service";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { TaskList } from "~/routes/tasks/TaskList";
import { RequireAuthn } from "~/components/auth/RequireAuthn";
import styles from "./pomodoroPage.module.css";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { useTaskList } from "~/routes/tasks/useTaskList";
import { Modal, Dialog, DialogTrigger, Button } from "react-aria-components";
import { TaskCheckbox } from "~/components/Checkbox/TaskCheckbox";
import { FaBolt } from "react-icons/fa";

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
  const d = new Date(date);
  if (!isDateToday(d)) {
    // Formato "dd/mm hh:mm"
    return (
      d.toLocaleDateString(navigator.language, {
        day: "2-digit",
        month: "2-digit",
      }) +
      " " +
      d.toLocaleTimeString(navigator.language, {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }
  // Formato "hh:mm"
  return d.toLocaleTimeString(navigator.language, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export let handle = {
  i18n: ["task", "study"],
};
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

  function completeSelectedTasks(completedTaskIds: number[]) {
    const tasksToComplete = completedTaskIds.map((id) =>
      service.updateTaskStatus(id, "completed")
    );

    return Promise.all(tasksToComplete)
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
    refreshTasks,
    setSelectedTaskIds,
    completeSelectedTasks,
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

        for (const event of eventsList) {
          const eventEndDate = new Date(event.endDate);
          if (eventEndDate >= now) {
            if (isDateToday(event.startDate)) {
              today.push(event);
            } else {
              future.push(event);
            }
          }
        }

        const sortFn = (a: Event, b: Event) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime();

        setTodayEvents(today.sort(sortFn));
        setFutureEvents(future.sort(sortFn).slice(0, 10));
      })
      .catch(setGlobalError)
      .finally(() => setIsLoading(false));
  }, [setGlobalError]);

  return { todayEvents, futureEvents, isLoading };
}

function AssociatedTaskListView({
  tasksForToday,
  otherTasks,
  selectedTaskIds,
  onTaskClick,
  showMicroTasks,
  onToggleMicroTasks,
  isReadOnly = false,
}: {
  tasksForToday: Task[];
  otherTasks: Task[];
  selectedTaskIds: number[];
  onTaskClick: (task: Task) => void;
  showMicroTasks: boolean;
  onToggleMicroTasks: () => void;
  isReadOnly?: boolean;
}) {
  const { t } = useTranslation(["task"]);

  if (isReadOnly) {
    const allTasks = [...tasksForToday, ...otherTasks];
    const selectedTasks = allTasks.filter((t) =>
      selectedTaskIds.includes(t.id)
    );

    return (
      <div className={styles.taskListContainer}>
        <h2 className={styles.taskListTitle}>
          {t("task:tasks_in_progress", "Tarefas em Curso")}
        </h2>
        {selectedTasks.length > 0 ? (
          <TaskList
            tasks={selectedTasks}
            onTaskClick={() => {}}
            onTaskStatusUpdated={() => {}}
            selectedTaskIds={selectedTaskIds}
            onSelectionToggle={() => {}}
            textColor={"var(--text-color-2)"}
          />
        ) : (
          <p className={styles.noEventsText}>
            {t("task:no_task_selected", "Nenhuma tarefa selecionada.")}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={styles.taskListContainer}>
      <label className={styles.microTaskToggle}>
        <TaskCheckbox
          checked={showMicroTasks}
          onClick={onToggleMicroTasks}
          className={styles.modalCheckbox}
        />
        {t("task:show_micro_tasks", "Incluir tarefas relâmpago")}
      </label>

      <h3 className={styles.instructionTitle}>
        SELECIONE AS TAREFAS EM QUE QUER TRABALHAR
      </h3>

      <h2 className={styles.taskListTitle}>
        {t("task:tasks_for_today", "Tarefas para Hoje")}
      </h2>
      <TaskList
        tasks={tasksForToday}
        onTaskClick={() => {}}
        onTaskStatusUpdated={() => {}}
        selectedTaskIds={selectedTaskIds}
        onSelectionToggle={onTaskClick}
        textColor={"var(--color-3)"}
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
        textColor={"var(--color-3)"}
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
  allTags = [],
}: {
  todayEvents: Event[];
  futureEvents: Event[];
  isLoading: boolean;
  allTags?: Tag[];
}) {
  const { t } = useTranslation(["study", "task"]);

  const renderColorBars = (event: Event) => {
    if (event.tags && event.tags.length > 0) {
      return (
        <div className={styles.eventColorStripContainer}>
          {event.tags.map((tagIdentifier: string, index: number) => {
            const tagObj = allTags.find(
              (t) =>
                t.name_pt === tagIdentifier ||
                t.name_en === tagIdentifier ||
                t.id === tagIdentifier
            );

            const finalColor = tagObj?.color || "var(--color-2)";
            const finalName = tagObj
              ? tagObj.name_en || tagObj.name_pt
              : tagIdentifier;

            return (
              <div
                key={index}
                className={styles.colorStripe}
                style={{ backgroundColor: finalColor }}
                title={finalName}
              />
            );
          })}
        </div>
      );
    }

    if (event.color && event.color.trim() !== "") {
      return (
        <div className={styles.eventColorStripContainer}>
          <div
            className={styles.colorStripe}
            style={{ backgroundColor: event.color }}
            title={event.title}
          />
        </div>
      );
    }

    return (
      <div className={styles.eventColorStripContainer}>
        <div
          className={styles.colorStripe}
          style={{ backgroundColor: "var(--color-2)" }}
        />
      </div>
    );
  };

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

            {renderColorBars(event)}

            <span className={styles.eventTitle}>{event.title}</span>
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
  studyStopDate,
  onStopClick,
  onTimerFinish,
  markTimerStart,
}: {
  happeningStudyBlock: Event | undefined;
  timerStopDate: Date | undefined;
  studyStopDate: Date | undefined;
  onStopClick: () => void;
  onTimerFinish: () => void;
  markTimerStart: () => void;
}) {
  const { t } = useTranslation("study");

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
    title = t("study:pause_time", "Pausa");
  }

  return (
    <div className={styles.pomodoroContainer}>
      <Timer
        title={title}
        stopDate={stopDate!}
        onStart={markTimerStart}
        onStopClick={onStopClick}
        onFinish={onTimerFinish}
      />
    </div>
  );
}

function PomodoroPage() {
  const { t } = useTranslation("study");
  const setGlobalError = useSetGlobalError();

  const [allUserTags, setAllUserTags] = useState<Tag[]>([]);
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
    completeSelectedTasks,
  } = useAssociatedTasks(showMicroTasks);

  const {
    todayEvents,
    futureEvents,
    isLoading: isLoadingEvents,
  } = useUpcomingEvents();

  const [happeningStudyBlock, setHappeningStudyBlock] = useState<
    Event | undefined
  >();
  const [isLoadingBlock, setIsLoadingBlock] = useState(true);

  useEffect(() => {
    service
      .fetchUserTags()
      .then((tags) => setAllUserTags(tags))
      .catch((err) => console.error("Erro ao carregar tags para cores:", err));
  }, []);

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
    completeSelectedTasks(completedTaskIds)
      .then(() => {})
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
    return <div>A carregar...</div>;
  }

  return (
    <>
      <div className={styles.pomodoroLayout}>
        <TodayEventsList
          todayEvents={todayEvents}
          futureEvents={futureEvents}
          isLoading={isLoadingEvents}
          allTags={allUserTags}
        />

        {timerStopDate || happeningStudyBlock ? (
          <TimerView
            happeningStudyBlock={happeningStudyBlock}
            timerStopDate={timerStopDate}
            studyStopDate={studyStopDate}
            onStopClick={onStopClick}
            onTimerFinish={onTimerFinish}
            markTimerStart={markTimerStart}
          />
        ) : (
          <div className={styles.pomodoroContainer}>
            <SelectTime onTimeSelected={onTimeSelected} />
          </div>
        )}

        <AssociatedTaskListView
          tasksForToday={tasksForToday}
          otherTasks={otherTasks}
          selectedTaskIds={selectedTaskIds}
          onTaskClick={toggleTaskSelection}
          showMicroTasks={showMicroTasks}
          onToggleMicroTasks={() => setShowMicroTasks((prev) => !prev)}
          isReadOnly={!!(timerStopDate || happeningStudyBlock)}
        />
      </div>

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

export default function StudyPageAuthControlled() {
  return (
    <RequireAuthn>
      <PomodoroPage />
    </RequireAuthn>
  );
}
