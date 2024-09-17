import { useState } from "react";
import styles from "./calendar.module.css";
import { CalendarMonthView } from "./MonthView";
import { CalendarWeekView } from "./WeekView";
import { CalendarDayView } from "./DayView";
import { AddEvent } from "./AddNewEvent";
import { AddScheduleNotAvailableBlock } from "./AddScheduleNotAvailableBlock";

const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

enum TimeGranularity {
	MONTH, WEEK, DAY
}

function DailyEvents() {
	return (
		<h1>
			Daily events will be displayed here...
		</h1>
	)
}

function TimeGranularityChangeButtons({onCalendarViewChangeClick} : {onCalendarViewChangeClick: (type: TimeGranularity) => void}) {
	return (
		<div>
			<button onClick={() => onCalendarViewChangeClick(TimeGranularity.MONTH)}>Monthly</button>
			<button onClick={() => onCalendarViewChangeClick(TimeGranularity.WEEK)}>Weekly</button>
			<button onClick={() => onCalendarViewChangeClick(TimeGranularity.DAY)}>Daily</button>
		</div>
	)
}

function Title({date} : {date: Date}) {
	return(
		<p className="title">{months[date.getMonth()] + " / " + date.getDate() + " / " + date.getFullYear()}</p>
	)
}

enum Navigate { PREVIOUS, TODAY, NEXT }

function NavigateButtons({onButtonClick} : {onButtonClick: (action: Navigate) => void}) {
	return (
		<div className={`${styles.changeViewButtons}`}>
			<button onClick={() => onButtonClick(Navigate.PREVIOUS)}>
				Previous
			</button>
			<button onClick={() => onButtonClick(Navigate.TODAY)}>
				Today
			</button>
			<button onClick={() => onButtonClick(Navigate.NEXT)}>
				Next
			</button>
		</div>
	)
}

function navigateOnMonth(oldDate: Date, action: Navigate): number {
	console.log("Hello1")
	switch (action) {
		case Navigate.PREVIOUS : return oldDate.getMonth() - 1
		case Navigate.NEXT : return oldDate.getMonth() + 1
	}
	throw new Error("Action not defined!")
}

function navigateOnWeek(oldDate: Date, action: Navigate): number {
	console.log("Hello2")
	switch (action) {
		case Navigate.PREVIOUS : return oldDate.getDate() - 7
		case Navigate.NEXT : return oldDate.getDate() + 7
	}
	throw new Error("Action not defined!")
}

function navigateOnDay(oldDate: Date, action: Navigate): number {
	console.log("Hello3")
	switch (action) {
		case Navigate.PREVIOUS : return oldDate.getDate() - 1
		case Navigate.NEXT : return oldDate.getDate() + 1
	}
	throw new Error("Action not defined!")
}

function useMyCalendar() {
	const [selectedTimeGranularity, setSelectedTimeGranularity] = useState<TimeGranularity>(TimeGranularity.MONTH)
	const [baseDate, setBaseDate] = useState<Date>(new Date()) // Starts as Today

	function onButtonClickHandler(action: Navigate) {
		let newDate = undefined

		if (action != Navigate.TODAY) {
			newDate = new Date(baseDate)

			switch(selectedTimeGranularity) {
				case TimeGranularity.MONTH : newDate.setMonth(navigateOnMonth(baseDate, action))
				break;
				case TimeGranularity.WEEK : newDate.setDate(navigateOnWeek(baseDate, action))
				break;
				case TimeGranularity.DAY : newDate.setDate(navigateOnDay(baseDate, action))
			}
		} else {
			newDate = new Date()
		}

		setBaseDate(newDate)
	}

	function setCalendarViewType(viewType: TimeGranularity) {
		setSelectedTimeGranularity(viewType)
	}

	return {
		selectedTimeGranularity,
		baseDate,
		onButtonClickHandler,
		setCalendarViewType,
	}
}

function Calendar({onAddNewEventClick} : {onAddNewEventClick: (startDate: Date) => void}) {
	const {
		selectedTimeGranularity,
		baseDate,
		onButtonClickHandler,
		setCalendarViewType,
	} = useMyCalendar()

	// Decides based on selected calendar view
	let calendarComponent
	switch(selectedTimeGranularity) {
		case TimeGranularity.MONTH: {
			calendarComponent =
				<CalendarMonthView dayProp={baseDate} onDayClick={(date: Date) => onAddNewEventClick(date)}/>
		}
		break
		case TimeGranularity.WEEK: calendarComponent = (
			<CalendarWeekView baseDate={baseDate} onHourClick={(date: Date) => onAddNewEventClick(date)} />
		)
		break
		case TimeGranularity.DAY: {
			calendarComponent = (
				<div>
					<CalendarDayView date={baseDate} onHourClick={(hour: number) => {
						baseDate.setHours(hour)
						onAddNewEventClick(baseDate)
					}} />
				</div>
			)
		}
	}

    return (
		<div className={`${styles.calendar}`}>
			<TimeGranularityChangeButtons onCalendarViewChangeClick={setCalendarViewType} />
			<br/>
			<NavigateButtons onButtonClick={onButtonClickHandler} />
			<Title date={baseDate} />
			{calendarComponent}
		</div>
    )
}

function useCalendarPage() {
	const [startDate, setStartDate] = useState<Date | undefined>(undefined)

	function clearStartDate() {
		setStartDate(undefined)
	}

	return { startDate, setStartDate, clearStartDate }
}

export default function CalendarPage() {
	const { startDate, setStartDate, clearStartDate } = useCalendarPage()

	const isAddNewEventViewTypeSelected = startDate != undefined

	const domToDisplay = isAddNewEventViewTypeSelected ?
		<AddEvent startDate={startDate} onNewEventCreated={clearStartDate}/>
		:
		(
			<div>
				<Calendar onAddNewEventClick={setStartDate}/>
				<br/>
				<h1>Add Unavailable Schedule Block</h1>
				<br/>
				<AddScheduleNotAvailableBlock />
				<br/>
				<DailyEvents />
				<br/>
			</div>
		)

	return domToDisplay
}