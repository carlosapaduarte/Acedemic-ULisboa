import { time } from "node:console";
import React, { useEffect, useState } from "react";
import useTimer from "react-timer-hook";
import { SelectTime } from "./TimeSelection";
import { Timer } from "./Timer";
import { service, Task } from "~/service/service";
import { utils } from "~/utils";
import { TaskList, useTaskList } from "../task-list/route";
import { SelectAssociatedTasks } from "./SelectAssociatedTasks";
import { Event } from "~/service/service";
import { CreateTask } from "../task-list/CreateTask";
import { useSetError } from "~/components/error/ErrorContainer";

function useTimerSetup() {
    const [studyStopDate, setStudyStopDate] = useState<Date | undefined>(undefined)
    const [pauseStopDate, setPauseStopDate] = useState<Date | undefined>(undefined)

    // This is the timer that is passed to the Timer component
    const [timerStopDate, setTimerStopDate] = useState<Date | undefined>(undefined)

    function onTimeSelected(studyStopDate: Date, pauseStopDate: Date) {
        setStudyStopDate(studyStopDate)
        setPauseStopDate(pauseStopDate)

        setTimerStopDate(studyStopDate)
    }

    function onTimerFinish() {
        if (timerStopDate == studyStopDate)
            setTimerStopDate(pauseStopDate)
        else
            setTimerStopDate(undefined)
    }

    return {
        timerStopDate,
        onTimeSelected,
        studyStopDate,
        setStudyStopDate,
        onTimerFinish
    }
}

function useStudyBlock() {
    const setError = useSetError();
    const [happeningStudyBlock, setHappeningStudyBlock] = useState<Event | undefined>()
    
    useEffect(() => {
        const userId = utils.getUserId()
        service.getStudyBlockHappeningNow(userId)
            .then((event: Event | undefined) => setHappeningStudyBlock(event))
            .catch((error) => setError(error));
    }, [])

    return happeningStudyBlock
}

function useAssociatedTasks() {
    const [associatedTasks, setAssociatedTasks] = useState<Task[] | undefined>(undefined)

    function onTasksSelected(tasks: Task[]) {
        setAssociatedTasks(tasks)
    }

    return {
        associatedTasks,
        onTasksSelected
    }
}

function SetupAndStartTimer() {
    const {
        timerStopDate,
        onTimeSelected,
        studyStopDate,
        setStudyStopDate,
        onTimerFinish
    } = useTimerSetup()

    if (timerStopDate == undefined)
        return (
            <SelectTime onTimeSelected={onTimeSelected} />
        )
    else {
        const title = studyStopDate ? "(Study Time)" : "(Pause Time)"
        return (
            <Timer title={title} stopDate={timerStopDate} onStopClick={() => setStudyStopDate(undefined)} onFinish={onTimerFinish} />
        )
    }
}

function StartTimerByStudyBlock({associatedTasks, happeningStudyBlock} : 
    {
        associatedTasks: Task[], 
        happeningStudyBlock: Event
    }) {
    const {
        studyStopDate,
        setStudyStopDate,
        onTimerFinish
    } = useTimerSetup()
    
    const [showCreateTask, setShowCreateTask] = useState(false)

    // Title is the name of the current study block event, and if it's in study or pause time
    const timerTitleMsg = happeningStudyBlock.title + studyStopDate ? "(Study Time)" : "(Pause Time)"
    const newTaskButtonMsg = showCreateTask ? "Cancel Task Creation" : "Create Task"

    return (
        <div>
            <Timer title={timerTitleMsg} stopDate={happeningStudyBlock.endDate} onStopClick={() => setStudyStopDate(undefined)} onFinish={onTimerFinish} />
            <TaskList tasks={associatedTasks} onTaskClick={() => {}} />
            <button onClick={() => setShowCreateTask(!showCreateTask)}>{newTaskButtonMsg}</button>
            {showCreateTask ?
                <CreateTask onTaskCreated={() => {}} />
                :
                <></>
            }
            
        </div>
    );
}

function TimerPage({associatedTasks} : {associatedTasks: Task[]}) {
    const happeningStudyBlock = useStudyBlock()

    // Means that there is no study block happening right now
    if (happeningStudyBlock == undefined) {
        return(<SetupAndStartTimer />)
    }
    // There is a study time block happening now. Timer will be set to the end of the study time
    else {
        return(<StartTimerByStudyBlock associatedTasks={associatedTasks} happeningStudyBlock={happeningStudyBlock} />)
    }
}

export default function StudyPage() {
    // In short, this component begins by asking the user to select a set of tasks to associate to the study time
    // If there is a study block now, it starts the timer to the end of the study block.
    // Otherwise, asks the user to select a study and pause time, first, and only then it starts the timer.

    const {associatedTasks, onTasksSelected} = useAssociatedTasks()

    // Select Associated Tasks!
    if (associatedTasks == undefined)
        return (<SelectAssociatedTasks onTasksSelected={onTasksSelected} />)
    // Associated Tasks selected!
    else {
        return(<TimerPage associatedTasks={associatedTasks} />)
    }
}