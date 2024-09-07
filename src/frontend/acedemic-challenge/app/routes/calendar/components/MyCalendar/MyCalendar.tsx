import { useState } from "react";
import { utils } from "~/utils";
import { Button, CutButton } from "~/components/Button/Button";
import { useTranslation } from "react-i18next";
import styles from "./myCalendar.module.css";

const weekdays = ["calendar:weekdays.sunday", "calendar:weekdays.monday", "calendar:weekdays.tuesday",
    "calendar:weekdays.wednesday", "calendar:weekdays.thursday", "calendar:weekdays.friday", "calendar:weekdays.saturday"];
const months = ["calendar:months.january", "calendar:months.february", "calendar:months.march", "calendar:months.april",
    "calendar:months.may", "calendar:months.june", "calendar:months.july", "calendar:months.august",
    "calendar:months.september", "calendar:months.october", "calendar:months.november", "calendar:months.december"];

enum MonthChangeAction { PREV_MONTH, NEXT_MONTH, TODAY }

function Title({ visibleMonth }: { visibleMonth: Date }) {
    const { t } = useTranslation(["calendar"]);

    return (
        <h2 className={`${styles.calendarTitle}`}>
            {t(months[visibleMonth.getMonth()]) + " / " + visibleMonth.getFullYear()}
        </h2>
    );
}

function ChangeViewButtons(
    { visibleMonth, onButtonClick }: { visibleMonth: Date, onButtonClick: (action: MonthChangeAction) => void }
) {
    return (
        <div className={`${styles.changeViewButtonsContainer}`}>
            <Button className={`${styles.changeMonthButton}`}
                    onClick={() => onButtonClick(MonthChangeAction.PREV_MONTH)}>
                {"<"}
            </Button>
            <Title visibleMonth={visibleMonth} />
            <Button className={`${styles.changeMonthButton}`}
                    onClick={() => onButtonClick(MonthChangeAction.NEXT_MONTH)}>
                {">"}
            </Button>
        </div>
    );
}

function useVisibleMonth() {
    const [visibleMonth, setVisibleMonth] = useState(new Date()); // Starts as Today

    function monthChangeActionHandler(action: MonthChangeAction) {
        const newDate = new Date(visibleMonth);

        let newMonth = -1;
        const currentSelectedMonth = visibleMonth.getMonth();
        switch (action) {
            case MonthChangeAction.PREV_MONTH :
                newMonth = currentSelectedMonth - 1;
                break;
            case MonthChangeAction.NEXT_MONTH :
                newMonth = currentSelectedMonth + 1;
                break;
            case MonthChangeAction.TODAY :
                newMonth = new Date().getMonth();
        }
        newDate.setMonth(newMonth);

        setVisibleMonth(newDate);
    }

    return { visibleMonth, monthChangeActionHandler };
}

export type CalendarDay = {
    currentMonth: boolean,
    date: Date,
    month: number,
    number: number,
    selected: boolean,
    year: number
}

function useCalendarDays(visibleMonth: Date) {
    let firstDayOfMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    let weekdayOfFirstDay = firstDayOfMonth.getDay();
    let currentDays: CalendarDay[] = [];

    let currentDate = new Date(firstDayOfMonth);

    for (let day = 0; day < 42; day++) {
        if (day === 0 && weekdayOfFirstDay === 0) {
            currentDate.setDate(currentDate.getDate() - 7);
        } else if (day === 0) {
            currentDate.setDate(currentDate.getDate() + (day - weekdayOfFirstDay));
        } else {
            currentDate.setDate(currentDate.getDate() + 1);
        }

        let calendarDay: CalendarDay = {
            currentMonth: (currentDate.getMonth() === visibleMonth.getMonth()),
            date: new Date(currentDate),
            month: currentDate.getMonth(),
            number: currentDate.getDate(),
            selected: (currentDate.toDateString() === visibleMonth.toDateString()),
            year: currentDate.getFullYear()
        };

        currentDays.push(calendarDay);
    }

    return { currentDays };
}

function WeekHeader() {
    const { t } = useTranslation(["calendar"]);

    return (
        <>
            {
                weekdays.map((weekday) => {
                    return (
                        <div key={weekday} className={`${styles.weekHeaderDayContainer}`}>
                            <h1 className={`${styles.weekHeaderDayText}`}>{t(weekday)}</h1>
                        </div>
                    );
                })
            }
        </>
    );
}

function Day({ day, onDayClick }: { day: CalendarDay, onDayClick: (day: CalendarDay) => void }) {
    const isCurrentMonth = day.currentMonth;

    const isToday = utils.sameDay(day.date, new Date());

    return (
        <CutButton className={`${styles.calendarDayContainer}`} onClick={() => onDayClick(day)}>
            <h1 className={
                `${styles.calendarDayText}
                ${isToday ? styles.today : ""}
                ${isCurrentMonth ? "" : styles.notCurrentMonth}`}>
                {day.number} {/*.toString().padStart(2, "0")*/}
            </h1>
        </CutButton>
    );
}

function CalendarDays({ visibleMonth, onDayClick }: { visibleMonth: Date, onDayClick: (day: CalendarDay) => void }) {
    const { currentDays } = useCalendarDays(visibleMonth);

    return (
        <>
            {
                currentDays.map((day: CalendarDay, index: number) => {
                    return (
                        <Day key={index} day={day} onDayClick={onDayClick} />
                    );
                })
            }
        </>
    );
}

function CalendarGrid({ visibleMonth, onDayClick }: { visibleMonth: Date, onDayClick: (day: CalendarDay) => void }) {
    return (
        <div className={`${styles.calendarGridContainer}`}> {/*${styles.switched}*/}
            <WeekHeader />
            <CalendarDays visibleMonth={visibleMonth} onDayClick={onDayClick} />
        </div>
    );
}

export function MyCalendar({ onDayClickHandler }: { onDayClickHandler: (day: CalendarDay) => void }) {
    const { visibleMonth, monthChangeActionHandler } = useVisibleMonth();

    return (
        <div className={`${styles.myCalendar}`}>
            <ChangeViewButtons visibleMonth={visibleMonth} onButtonClick={monthChangeActionHandler} />
            <CalendarGrid visibleMonth={visibleMonth} onDayClick={onDayClickHandler} />
        </div>
    );
}