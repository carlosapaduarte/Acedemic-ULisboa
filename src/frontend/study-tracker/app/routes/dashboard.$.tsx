import { useEffect, useState } from "react";
import { service, Task } from "~/service/service";
import { utils } from "~/utils";

/**
 * Determines initial quote to be displayed to user, based on current time of day.
 */
function get_welcome_message() {
    const hourOfDay = new Date().getHours();
    switch (true) {
        case hourOfDay < 5:
            return "Good Night!"
        case hourOfDay < 12:
            return "Good Morning!"
        case hourOfDay < 17:
            return "Good Afternoon!"
        case hourOfDay < 20:
            return "Good Evening!"
        default:
            return "Good Night!"
    }
}

function WeekGoal() {
    return (
        <p><b>Don't forget to do "week-goal" this week!</b></p>
    )
}

function useDailyTasks() {
    const [tasks, setTasks] = useState<Task[] | undefined>(undefined)

    useEffect(() => {
        let userId = utils.getUserId()
        service.getTodayTasks(userId)
            .then((tasks: Task[]) => setTasks(tasks))
    }, [])

    return { tasks }
}

function DailyTasks() {
    const { tasks } = useDailyTasks()

    return (
        <div>
            <h1>Today's Tasks!</h1>
            {tasks?.map((task: Task, index: number) => 
                <div key={index}>
                    <p>{task.title}</p>
                    <p>{task.tag}</p>
                </div>
            )}
        </div>
    )
}

function WeekSchedule() {
    // Maybe, show a week calendar here

    return (
        <h1>TO BE DISPLAYED...</h1>
    )
}

function WeekStats() {
    return (
        <h1>STATS TO BE DISPLAYED...</h1>
    )
}

export default function Dashboard() {
    return (
        <div>
            <h1>Dashboard</h1>
            <img src="test.webp" alt="Avatar" />
            <p>{get_welcome_message()}</p>
            <WeekGoal/>
            <DailyTasks/>
            <WeekSchedule/>
            <WeekStats/>
        </div>
    )
}