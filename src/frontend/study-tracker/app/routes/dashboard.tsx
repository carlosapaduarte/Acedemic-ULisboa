import { useEffect, useState } from "react";
import { RequireAuthn } from "~/components/auth/RequireAuthn";
import { Event, service } from "~/service/service";

/**
 * Determines initial quote to be displayed to user, based on current time of day.
 */
function get_welcome_message() {
    const hourOfDay = new Date().getHours();
    switch (true) {
        case hourOfDay < 5:
            return "Good Night!";
        case hourOfDay < 12:
            return "Good Morning!";
        case hourOfDay < 17:
            return "Good Afternoon!";
        case hourOfDay < 20:
            return "Good Evening!";
        default:
            return "Good Night!";
    }
}

function WeekGoal() {
    return (
        <p><b>Don't forget to do "week-goal" this week!</b></p>
    );
}

function useDailyEvents() {
    const [events, setEvents] = useState<Event[] | undefined>(undefined);

    useEffect(() => {
        service.getUserTodayEvents()
            .then((events: Event[]) => setEvents(events));
    }, []);

    return { events };
}

function DailyEvents() {
    const { events } = useDailyEvents();

    return (
        <RequireAuthn>
            <div>
                <h1>Today's Events!</h1>
                {events?.map((events: Event, index: number) =>
                    <div key={index}>
                        <p>{events.title}</p>
                        <p>{events.tags}</p>
                    </div>
                )}
            </div>
        </RequireAuthn>
    );
}

function WeekSchedule() {
    // Maybe, show a week calendar here

    return (
        <h1>TO BE DISPLAYED...</h1>
    );
}

function WeekStats() {
    return (
        <h1>STATS TO BE DISPLAYED...</h1>
    );
}

export default function Dashboard() {
    return (
        <div>
            <h1>Dashboard</h1>
            <img src="test.webp" alt="Avatar" />
            <p>{get_welcome_message()}</p>
            <WeekGoal />
            <DailyEvents />
            <WeekSchedule />
            <WeekStats />
        </div>
    );
}