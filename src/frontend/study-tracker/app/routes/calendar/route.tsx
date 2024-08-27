import { t } from "i18next";
import { useState } from "react";
import styles from "./calendar.module.css";
import { CalendarMonthView } from "./MonthView";
import { CalendarWeekView } from "./WeekView";
import { CalendarDayView } from "./DayView";
import { AddNewTaskInfo, AddTask } from "./AddNewTask";

const months = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'];

enum CalendarViewType {
	MONTH, WEEK, DAY
}

export default function CalendarPage() {
	const { addNewTaskInfo, setAddNewTaskInfo, clearAddNewTaskInfo } = useCalendarPage()
	
	const isAddNewTaskViewTypeSelected = addNewTaskInfo != undefined
	
	const domToDisplay = isAddNewTaskViewTypeSelected ?
		<AddTask addNewTaskInfo={addNewTaskInfo} onNewTaskCreated={clearAddNewTaskInfo}/>
		:
		(
			<div>
				<Calendar onAddNewTaskClick={setAddNewTaskInfo}/>
				<br/>
				<DailyTasks />
				<br/>
			</div>
		)

	return domToDisplay
}

function useCalendarPage() {
	const [addNewTaskInfo, setAddNewTaskInfo] = useState<AddNewTaskInfo | undefined>(undefined)

	function clearAddNewTaskInfo() {
		setAddNewTaskInfo(undefined)
	}

	return { addNewTaskInfo, setAddNewTaskInfo, clearAddNewTaskInfo }
}

function DailyTasks() {
	return (
		<h1>
			Daily tasks will be displayed here...
		</h1>
	)
}

function Calendar({onAddNewTaskClick} : {onAddNewTaskClick: (addNewTaskInfo: AddNewTaskInfo) => void}) {
	const {
		calendarViewType,
		baseDate,
		onButtonClickHandler,
		setCalendarViewType,
	} = useMyCalendar()

	// Decides based on selected calendar view
	let calendarComponent
	switch(calendarViewType) {
		case CalendarViewType.MONTH: {
			calendarComponent =
				<CalendarMonthView dayProp={baseDate} onDayClick={(date: Date) => onAddNewTaskClick({date, hour: undefined})}/>
		}
		break
		case CalendarViewType.WEEK: calendarComponent = (
			<CalendarWeekView onHourClick={(date: Date) => onAddNewTaskClick({date, hour: date.getHours()})} />
		)
		break
		case CalendarViewType.DAY: {
			const today = new Date()
			calendarComponent = (
				<div>
					<CalendarDayView date={today} onHourClick={(hour: number) => onAddNewTaskClick({date: today, hour})} />
				</div>
			)
		} 
	}

    return (
		<div className={`${styles.calendar}`}>
			<CalendarViewChangeButtons onCalendarViewChangeClick={setCalendarViewType} />
			<br/>
			<ChangeViewButtons onButtonClick={onButtonClickHandler} />
			<Title date={baseDate} />
			{calendarComponent}
		</div>
    )
}

function useMyCalendar() {
	const [calendarViewType, setCalendarViewTypeInternal] = useState<CalendarViewType>(CalendarViewType.MONTH)
	const [baseDate, setBaseDate] = useState(new Date()) // Starts as Today

	function onButtonClickHandler(action: Action) {
		const newDate = new Date()
		
		let newMonth = -1
		const currentSelectedMonth = baseDate.getMonth()
		switch (action) {
			case Action.PREV_MONTH : newMonth = currentSelectedMonth - 1
			break
			case Action.NEXT_MONTH : newMonth = currentSelectedMonth + 1
			break
			case Action.TODAY : newMonth = new Date().getMonth()
		}
		newDate.setMonth(newMonth)
		setBaseDate(newDate)
	}

	function setCalendarViewType(viewType: CalendarViewType) {
		setCalendarViewTypeInternal(viewType)
	}

	return {
		calendarViewType,
		baseDate,
		onButtonClickHandler,
		setCalendarViewType,
	}
}

function CalendarViewChangeButtons({onCalendarViewChangeClick} : {onCalendarViewChangeClick: (type: CalendarViewType) => void}) {
	return (
		<div>
			<button onClick={() => onCalendarViewChangeClick(CalendarViewType.MONTH)}>Monthly</button>
			<button onClick={() => onCalendarViewChangeClick(CalendarViewType.WEEK)}>Weekly</button>
			<button onClick={() => onCalendarViewChangeClick(CalendarViewType.DAY)}>Daily</button>
		</div>
	)
}

function Title({date} : {date: Date}) {
	return(
		<p className="title">{months[date.getMonth()] + " / " + date.getDate() + " / " + date.getFullYear()}</p>
	)
}

enum Action { PREV_MONTH, NEXT_MONTH, TODAY }

function ChangeViewButtons({onButtonClick} : {onButtonClick: (action: Action) => void}) {
	return (
		<div className={`${styles.changeViewButtons}`}>
			<button onClick={() => onButtonClick(Action.PREV_MONTH)}>
				{t("calendar:prev_month_but")}
			</button>
			<button onClick={() => onButtonClick(Action.TODAY)}>
				{t("calendar:today")}
			</button>
			<button onClick={() => onButtonClick(Action.NEXT_MONTH)}>
				{t("calendar:next_month_but")}
			</button>
		</div>
	)
}