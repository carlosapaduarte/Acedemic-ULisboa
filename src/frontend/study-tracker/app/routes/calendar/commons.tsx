import { utils } from "~/utils"
import styles from "./calendar.module.css";

export type CalendarDay = {
    currentMonth: boolean,
    date: Date,
    month: number,
    number: number,
    selected: boolean,
    year: number
}

export const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function WeekHeader() {
	return(
		<div className={`${styles.calendarItems}`}>
			{
				weekdays.map((weekday) => {
					return (
						<div key={weekday} className={`${styles.calendarItem}`}>
							{weekday}
						</div>
					)
				})
			}
		</div>
	)
}

export function Day({day, onDayClick} : {day: CalendarDay, onDayClick: (day: CalendarDay) => void}) {

	// Determines the style applied to the text
	const isCurrentMonth = day.month == new Date().getMonth()	
	const isToday = utils.sameDay(day.date, new Date())
	
	return (
		<div className={`${styles.calendarItem}`} onClick={() => onDayClick(day)}>
			<p 
				className={`${styles.calendarItemText} ${isToday ? styles.today : ""} ${!isCurrentMonth ? styles.lowOpacity : ""}`}
			>
				{day.number}
			</p>
		</div>
	)
}

/**
 * This function builds a Date[], where each value represents an hour range
 * @param numberOfDays
 */
export function buildHours(numberOfDays: number): Date[] {
	const weekDay = new Date().getDay()
	const today = new Date()
	
	// Offsets to first day of week
	const tmp = new Date()
	tmp.setDate(today.getDate() - weekDay)

	const hoursToStore: Date[] = []
	for (let curHour = 0; curHour < 24; curHour++) {
		for (let u = 0; u < numberOfDays; u++) {
			const curDay = new Date(tmp)
			curDay.setHours(curHour)
			hoursToStore.push(curDay)
		}
		// Advances one day
		tmp.setDate(tmp.getDate() + 1)
	}

	return hoursToStore
}
