import { useState } from "react";
import { utils } from "~/utils";
import { Button } from "~/components/Button";
import { useTranslation } from "react-i18next";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

const calendarElemSize = "2%";

export function MyCalendar({ onDayClickHandler }: { onDayClickHandler: (day: CalendarDay) => void }) {
    const [baseDate, setBaseDate] = useState(new Date()); // Starts as Today

    function onButtonClickHandler(action: Action) {
        const newDate = new Date();

        let newMonth = -1;
        const currentSelectedMonth = baseDate.getMonth();
        switch (action) {
            case Action.PREV_MONTH :
                newMonth = currentSelectedMonth - 1;
                break;
            case Action.NEXT_MONTH :
                newMonth = currentSelectedMonth + 1;
                break;
            case Action.TODAY :
                newMonth = new Date().getMonth();
        }
        newDate.setMonth(newMonth);

        setBaseDate(newDate);
    }

    return (
        <div style={{ marginTop: "2%" }}>
            <ChangeViewButtons onButtonClick={onButtonClickHandler} />
            <Title date={baseDate} />
            <WeekHeader />
            <CalendarDays dayProp={baseDate} onDayClick={onDayClickHandler} />
        </div>
    );
}

function Title({ date }: { date: Date }) {
    return (
        <h2 style={{ fontSize: "170%" }}>{months[date.getMonth()] + " / " + date.getDate() + " / " + date.getFullYear()}</h2>
    );
}

enum Action { PREV_MONTH, NEXT_MONTH, TODAY }

function ChangeViewButtons({ onButtonClick }: { onButtonClick: (action: Action) => void }) {
    const { t } = useTranslation(["calendar"]);

    return (
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: "2%" }}>
            <Button variant="round" onClick={() => onButtonClick(Action.PREV_MONTH)}>
                {t("calendar:prev_month_but")}
            </Button>
            <Button variant="round" onClick={() => onButtonClick(Action.TODAY)}>
                {t("calendar:today")}
            </Button>
            <Button variant="round" onClick={() => onButtonClick(Action.NEXT_MONTH)}>
                {t("calendar:next_month_but")}
            </Button>
        </div>
    );
}

function WeekHeader() {
    return (
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly", marginBottom: "1%" }}>
            {
                weekdays.map((weekday) => {
                    return (
                        <div key={weekday} style={{ alignItems: "center", width: calendarElemSize }}>
                            <h1 style={{ fontSize: "170%" }}>{weekday}</h1>
                        </div>
                    );
                })
            }
        </div>
    );
}

export type CalendarDay = {
    currentMonth: boolean,
    date: Date,
    month: number,
    number: number,
    selected: boolean,
    year: number
}

function CalendarDays({ dayProp, onDayClick }: { dayProp: Date, onDayClick: (day: CalendarDay) => void }) {
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
        };

        currentDays.push(calendarDay);
    }

    function parsePerWeek(days: CalendarDay[]): CalendarDay[][] {
        const daysPerWeek: CalendarDay[][] = [];

        const chunkSize = 7; // number of days in a week
        while (days.length > 0) {
            daysPerWeek.push(currentDays.splice(0, chunkSize));
        }

        return daysPerWeek;
    }

    const daysPerWeek: CalendarDay[][] = parsePerWeek(currentDays);

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            {
                daysPerWeek.map((weekDays: CalendarDay[], index: number) => {
                    return (
                        <div key={index}
                             style={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly" }}>
                            {
                                weekDays.map((day: CalendarDay) => {
                                    return (
                                        <Day key={day.date.getDate()} day={day} onDayClick={onDayClick} />
                                    );
                                })
                            }
                        </div>
                    );
                })
            }
        </div>
    );
}

function Day({ day, onDayClick }: { day: CalendarDay, onDayClick: (day: CalendarDay) => void }) {
    const isCurrentMonth = day.month == new Date().getMonth();
    const opacity = isCurrentMonth ? "100%" : "35%";

    const isToday = utils.sameDay(day.date, new Date());
    const fontColor = isToday ? "red" : "black";

    return (
        <div style={{ alignItems: "center", width: calendarElemSize }} onClick={() => onDayClick(day)}>
            <h1 style={{ fontSize: "150%", padding: "20%", opacity: opacity, color: fontColor }}>
                {day.number}
            </h1>
        </div>
    );
}