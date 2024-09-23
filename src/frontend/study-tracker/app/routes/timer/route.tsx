import React, { useEffect, useState } from "react";
import { SelectTime } from "./TimeSelection";
import { Timer } from "./Timer";
import { Event, service, Task } from "~/service/service";
import { utils } from "~/utils";
import { SelectAssociatedTasks } from "./SelectAssociatedTasks";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { CreateTaskView } from "../task-list/CreateTask";
import { TaskList } from "../task-list/TaskList";
import { RequireAuthn } from "~/components/auth/RequireAuthn";

function useTimerSetup() {
    const [studyStopDate, setStudyStopDate] = useState<Date | undefined>(undefined);
    const [pauseStopDate, setPauseStopDate] = useState<Date | undefined>(undefined);

    // This is the timer that is passed to the Timer component
    const [timerStopDate, setTimerStopDate] = useState<Date | undefined>(undefined);

    function onTimeSelected(studyStopDate: Date, pauseStopDate: Date) {
        setStudyStopDate(studyStopDate);
        setPauseStopDate(pauseStopDate);

        setTimerStopDate(studyStopDate);
    }

    function onTimerFinish() {
        if (timerStopDate == studyStopDate)
            setTimerStopDate(pauseStopDate);
        else
            setTimerStopDate(undefined);
    }

    return {
        timerStopDate,
        onTimeSelected,
        studyStopDate,
        setStudyStopDate,
        onTimerFinish
    };
}

function useStudyBlock() {
    const setError = useSetGlobalError();
    const [happeningStudyBlock, setHappeningStudyBlock] = useState<Event | undefined>();

    useEffect(() => {
        const userId = utils.getUserId();
        service.getStudyBlockHappeningNow(userId)
            .then((event: Event | undefined) => setHappeningStudyBlock(event))
            .catch((error) => setError(error));
    }, []);

    return happeningStudyBlock;
}

function useAssociatedTasks() {
    const [associatedTasks, setAssociatedTasks] = useState<Task[] | undefined>(undefined);

    function onTasksSelected(tasks: Task[]) {
        setAssociatedTasks(tasks);
    }

    return {
        associatedTasks,
        onTasksSelected
    };
}

function AssociatedTaskListView({ associatedTasks }: { associatedTasks: Task[] }) {
    // Displays a list of tasks and button to create a new one.
    // In each task, there is a button that allows to change it's status. Therefore, it's possible to mak it as concluded!

    const [showCreateTask, setShowCreateTask] = useState(false);
    const newTaskButtonMsg = showCreateTask ? "Cancel Task Creation" : "Create Task";

    function onTaskCreated(task: Task) {
        associatedTasks.push(task);
        setShowCreateTask(false); // Closes new-task form
    }

    return (
        <div>
            <TaskList tasks={associatedTasks} onTaskClick={undefined} onTaskStatusUpdated={undefined} />
            <button onClick={() => setShowCreateTask(!showCreateTask)}>{newTaskButtonMsg}</button>
            {showCreateTask ?
                <CreateTaskView onTaskCreated={onTaskCreated} />
                :
                <></>
            }
        </div>
    );
}

function SetupAndStartTimer({ associatedTasks }: { associatedTasks: Task[] }) {
    // Displays a Timer setup;
    // Once the user selects the Study and Pause time, it begins to count;
    // Along with the timer, it displays a list of tasks and button to create a new one.

    const {
        timerStopDate,
        onTimeSelected,
        studyStopDate,
        setStudyStopDate,
        onTimerFinish
    } = useTimerSetup();

    if (timerStopDate == undefined)
        return (
            <SelectTime onTimeSelected={onTimeSelected} />
        );
    else {
        const title = studyStopDate ? "(Study Time)" : "(Pause Time)";
        return (
            <div>
                <Timer title={title} stopDate={timerStopDate} onStopClick={() => setStudyStopDate(undefined)}
                       onFinish={onTimerFinish} />
                <AssociatedTaskListView associatedTasks={associatedTasks} />
            </div>
        );
    }
}

function StartTimerByStudyBlock({ associatedTasks, happeningStudyBlock }:
                                    // Starts a timer that is schedule to end when the Study event finishes;
                                    // Along with the timer, it displays a list of tasks and button to create a new one.

                                    {
                                        associatedTasks: Task[],
                                        happeningStudyBlock: Event
                                    }) {
    const {
        studyStopDate,
        setStudyStopDate,
        onTimerFinish
    } = useTimerSetup();

    // Title is the name of the current study block event, and if it's in study or pause time
    const timerTitleMsg = happeningStudyBlock.title + studyStopDate ? "(Study Time)" : "(Pause Time)";

    return (
        <div>
            <Timer title={timerTitleMsg} stopDate={happeningStudyBlock.endDate}
                   onStopClick={() => setStudyStopDate(undefined)} onFinish={onTimerFinish} />
            <AssociatedTaskListView associatedTasks={associatedTasks} />
        </div>
    );
}

function TimerAndAssociatedTasksView({ associatedTasks }: { associatedTasks: Task[] }) {
    // Checks if there is a Study block happening now;
    // If yes, starts a timer that is schedule to end when the study block ends;
    // Otherwise, displays a timer setup view, and once the user configures the time (Study and Pause time), starts the timer;
    // In both cases, the associated tasks will be visible under the timer, along with a "create-task" button

    const happeningStudyBlock = useStudyBlock();

    // Means that there is no study block happening right now
    if (happeningStudyBlock == undefined) {
        return (<SetupAndStartTimer associatedTasks={associatedTasks} />);
    }
    // There is a study time block happening now. Timer will be set to the end of the study time
    else {
        return (<StartTimerByStudyBlock associatedTasks={associatedTasks} happeningStudyBlock={happeningStudyBlock} />);
    }
}

function StudyPage() {
    // In short, this component begins by asking the user to select a set of tasks to associate to the study time
    // If there is a study block now, it starts the timer to the end of the study block.
    // Otherwise, asks the user to select a study and pause time, first, and only then it starts the timer.

    const { associatedTasks, onTasksSelected } = useAssociatedTasks();

    return associatedTasks == undefined ?
        <SelectAssociatedTasks onTasksSelected={onTasksSelected} />
    :
        <TimerAndAssociatedTasksView associatedTasks={associatedTasks} />
}

export default function StudyPageAuthControlled() {
    return (
        <RequireAuthn>
            <StudyPage />
        </RequireAuthn>
    )
}