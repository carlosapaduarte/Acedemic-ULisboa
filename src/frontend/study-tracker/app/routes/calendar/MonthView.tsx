import styles from "./calendar.module.css";
import { CalendarDay, Day, WeekHeader } from "./commons";

export function CalendarMonthView({dayProp, onDayClick} : {dayProp: Date, onDayClick: (date: Date) => void}) {
    const currentDays = getCalendarMonthViewCurrentDays(dayProp)
	return (
		<div>
			<WeekHeader/>
			<div className={`${styles.calendarItems}`}>
			{
				currentDays.map((day: CalendarDay, index: number) => 
					<Day 
						key={index} 
						day={day} 
						onDayClick={(day: CalendarDay) => onDayClick(new Date(day.date))} />
				)
			}
		</div>
	  </div>
    )
}

function getCalendarMonthViewCurrentDays(dayProp: Date) {
	let firstDayOfMonth = new Date(dayProp.getFullYear(), dayProp.getMonth(), 1);
    let weekdayOfFirstDay = firstDayOfMonth.getDay();
    let currentDays: CalendarDay[] = [];

    for (let day = 0; day < 42; day++) {
        if (day === 0 && weekdayOfFirstDay === 0) {
          firstDayOfMonth.setDate(firstDayOfMonth.getDate() - 7);
        } else if (day === 0) {
          firstDayOfMonth.setDate(firstDayOfMonth.getDate() + (day - weekdayOfFirstDay));
        } else {
          firstDayOfMonth.setDate(firstDayOfMonth.getDate() + 1);
        }
    
        let calendarDay: CalendarDay = {
          currentMonth: (firstDayOfMonth.getMonth() === dayProp.getMonth()),
          date: (new Date(firstDayOfMonth)),
          month: firstDayOfMonth.getMonth(),
          number: firstDayOfMonth.getDate(),
          selected: (firstDayOfMonth.toDateString() === dayProp.toDateString()),
          year: firstDayOfMonth.getFullYear()
        }
    
        currentDays.push(calendarDay);
    }

	return currentDays
}