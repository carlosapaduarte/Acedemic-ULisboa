import styles from "./calendar.module.css";
import { buildHours, weekdays } from "./commons";

export function CalendarDayView({date, onHourClick} : {date: Date, onHourClick: (hour: number) => void}) {
	const hours = buildHours(1)
	return (
		<div className={`${styles.calendarItems} ${styles.singleCol}`}>
			<span className={`${styles.calendarItem}`}>
				{getWeekDayStr(date)}
			</span>
			<span className={`${styles.calendarItem}`}>
				{date.getDate()}
			</span>
			{hours.map((date: Date) => 
				<div className={`${styles.calendarItem} ${styles.hour}`} onClick={() => onHourClick(date.getHours())}>
					{date.getHours()}
				</div>
			)}
		</div>
	)
}

function getWeekDayStr(date: Date) {
	return weekdays[date.getDay()]
}