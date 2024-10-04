import { buildHours, CalendarDay, Day, WeekHeader } from "./commons";
import styles from "./calendar.module.css";

export function CalendarWeekView({ baseDate, onHourClick }: { baseDate: Date, onHourClick: (date: Date) => void }) {
    const weekDays: CalendarDay[] = buildDates(baseDate);
    return (
        <div>
            <WeekHeader />
            <div className={`${styles.calendarItems}`}>
                {weekDays.map((day: CalendarDay, index: number) =>
                    <Day key={index} day={day} onDayClick={() => {
                    }} />
                )}
            </div>
            <Hours onHourClick={onHourClick} />
        </div>
    );
}

function buildDates(baseDate: Date): CalendarDay[] {
    const weekDay = baseDate.getDay();

    // Offsets to first day of week
    const tmp = new Date();
    tmp.setDate(baseDate.getDate() - weekDay);

    const storedDays: CalendarDay[] = [];
    for (let u = 0; u < 7; u++) {
        const curDay = new Date(tmp);

        let calendarDay: CalendarDay = {
            currentMonth: true,
            date: curDay,
            month: curDay.getMonth(),
            number: curDay.getDate(),
            selected: false,
            year: curDay.getFullYear()
        };

        storedDays.push(calendarDay);

        // Advances one day
        tmp.setDate(tmp.getDate() + 1);
    }
    return storedDays;
}

function Hours({ onHourClick }: { onHourClick: ((date: Date) => void) }) {
    // This component displays a 24 * 7 grid: 24 hours per day of the week

    const hours = buildHours(7);
    return (
        <div className={`${styles.calendarItems}`}>
            {hours.map((date: Date, index: number) =>
                <div key={index} className={`${styles.calendarItem} ${styles.hour}`} onClick={() => onHourClick(date)}>
                    {date.getHours()}
                </div>
            )}
        </div>
    );
}