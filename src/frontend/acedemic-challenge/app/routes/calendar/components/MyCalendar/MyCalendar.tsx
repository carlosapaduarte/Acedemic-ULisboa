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

enum Action { PREV_MONTH, NEXT_MONTH, TODAY }

function Title({ date }: { date: Date }) {
    const { t } = useTranslation(["calendar"]);

    return (
        <h2 className={`${styles.calendarTitle}`}>
            {t(months[date.getMonth()]) /*+ " / " + date.getDate()*/ + " / " + date.getFullYear()}
        </h2>
    );
}

function ChangeViewButtons(
    { date, onButtonClick }: { date: Date, onButtonClick: (action: Action) => void }
) {
    const { t } = useTranslation(["calendar"]);

    return (
        <div className={`${styles.changeViewButtonsContainer}`}>
            <Button className={`${styles.changeMonthButton}`} onClick={() => onButtonClick(Action.PREV_MONTH)}>
                {"<"}
            </Button>
            <Title date={date} />
            <Button className={`${styles.changeMonthButton}`} onClick={() => onButtonClick(Action.NEXT_MONTH)}>
                {">"}
            </Button>
            {/*<Button variant="round" onClick={() => onButtonClick(Action.PREV_MONTH)}>
                {t("calendar:prev_month_but")}
            </Button>
            <Title date={date} />
            <Button variant="round" onClick={() => onButtonClick(Action.TODAY)}>
                {t("calendar:today")}
            </Button>
            <Button variant="round" onClick={() => onButtonClick(Action.NEXT_MONTH)}>
                {t("calendar:next_month_but")}
            </Button>*/}
        </div>
    );
}

function useMyCalendar() {
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

    return { baseDate, onButtonClickHandler };
}

export type CalendarDay = {
    currentMonth: boolean,
    date: Date,
    month: number,
    number: number,
    selected: boolean,
    year: number
}

function useCalendarDays(dayProp: Date) {
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

    return { daysPerWeek };
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
    const isNotCurrentMonth = day.month != new Date().getMonth();

    const isToday = utils.sameDay(day.date, new Date());

    return (
        <CutButton className={`${styles.calendarDayContainer}`} onClick={() => onDayClick(day)}>
            <h1 className={
                `${styles.calendarDayText}
                ${isToday ? styles.today : ""}
                ${isNotCurrentMonth ? styles.notCurrentMonth : ""}`}>
                {day.number} {/*.toString().padStart(2, "0")*/}
            </h1>
        </CutButton>
    );
}

function CalendarDays({ dayProp, onDayClick }: { dayProp: Date, onDayClick: (day: CalendarDay) => void }) {
    const { daysPerWeek } = useCalendarDays(dayProp);

    const flattenedDays = daysPerWeek.flat();

    return (
        <>
            {
                flattenedDays.map((day: CalendarDay, index: number) => {
                    return (
                        <Day key={index} day={day} onDayClick={onDayClick} />
                    );
                })
            }
        </>
    );
}

function CalendarGrid({ dayProp, onDayClick }: { dayProp: Date, onDayClick: (day: CalendarDay) => void }) {
    return (
        <div className={`${styles.calendarGridContainer}`}>
            <WeekHeader />
            <CalendarDays dayProp={dayProp} onDayClick={onDayClick} />
        </div>
    );
}

export function MyCalendar({ onDayClickHandler }: { onDayClickHandler: (day: CalendarDay) => void }) {
    const { baseDate, onButtonClickHandler } = useMyCalendar();

    return (
        <div className={`${styles.myCalendar}`}>
            <ChangeViewButtons date={baseDate} onButtonClick={onButtonClickHandler} />
            <CalendarGrid dayProp={baseDate} onDayClick={onDayClickHandler} />
        </div>
    );
}