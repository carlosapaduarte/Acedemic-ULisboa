import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import interactionPlugin, {DateClickArg} from "@fullcalendar/interaction" // needed for dayClick

export default function Calendar() {
    const handleDateClick = (arg: DateClickArg) => {
        alert(arg.dateStr)
    }

    return (
        <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            dateClick={handleDateClick}
        />
    )
}