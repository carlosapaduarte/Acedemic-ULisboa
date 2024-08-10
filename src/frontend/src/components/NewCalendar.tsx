import { Box, Typography } from "@mui/material";
import { useState } from "react";

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'];

const calendarElemSize = "2%"

export function NewCalendar() {
    const [currentDay, setCurrentDay] = useState(new Date())

    const changeCurrentDay = (day: CalendarDay) => {
        setCurrentDay(new Date(day.year, day.month, day.number));
    }

    return (
    	<Box>
			<Typography variant="h4" marginTop="2%" marginBottom="2%">{months[currentDay.getMonth()]} {currentDay.getFullYear()}</Typography>
			<Box>
				<Box display="flex" flexDirection="row" justifyContent="space-evenly" marginBottom="1%">
					{
						weekdays.map((weekday) => {
							return (
								<Box alignItems="center" width={calendarElemSize}>
									<Typography fontSize="170%">{weekday}</Typography>
								</Box>
							)
						})
					}
				</Box>
				<CalendarDays dayProp={currentDay} changeCurrentDay={changeCurrentDay} />
			</Box>
      </Box>
    )
}

type CalendarDay = {
    currentMonth: boolean,
    date: Date,
    month: number,
    number: number,
    selected: boolean,
    year: number
}

function CalendarDays({dayProp, changeCurrentDay} : {dayProp: Date, changeCurrentDay: (day: CalendarDay) => void}) {
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

	function parsePerWeek(days: CalendarDay[]): CalendarDay[][] {
		const daysPerWeek: CalendarDay[][] = []	

		const chunkSize = 7 // number of days in a week
		while(days.length > 0) {
			daysPerWeek.push(currentDays.splice(0, chunkSize))
		}
		
		return daysPerWeek
	}

	const daysPerWeek: CalendarDay[][] = parsePerWeek(currentDays)

    return (
        <Box display="flex" flexDirection="column">
        {
        	daysPerWeek.map((weekDays: CalendarDay[]) => {
				return(
					<Box display="flex" flexDirection="row" justifyContent="space-evenly">
						{
							weekDays.map((day: CalendarDay) => {
								return (
									<Day day={day} changeCurrentDay={changeCurrentDay} />
								)
							})
						}
					</Box>
				)
          })
        }
      </Box>
    )
}

function Day({day, changeCurrentDay} : {day: CalendarDay, changeCurrentDay: (day: CalendarDay) => void}) {
	const isCurrentMonth = day.month == new Date().getMonth()
	return (
		<Box alignItems="center" width={calendarElemSize} onClick={() => changeCurrentDay(day)}>
			<Typography fontSize="150%" padding="20%" sx={{opacity: isCurrentMonth ? "100%" : "35%"}}>{day.number}</Typography>
		</Box>
	)
}