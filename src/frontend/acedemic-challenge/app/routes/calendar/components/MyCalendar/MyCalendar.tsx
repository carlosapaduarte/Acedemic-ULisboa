import { useState } from "react";
import { utils } from "~/utils";
import { Button } from "~/components/Button/Button";
import { useTranslation } from "react-i18next";
import styles from "./myCalendar.module.css";
import classNames from "classnames";
import { BatchDay } from "~/challenges/types";

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

function Day(
    {
        day, onDayClick, hasChallenge, selected, completed
    }: {
        day: CalendarDay, onDayClick: (day: CalendarDay) => void,
        selected: boolean,
        hasChallenge: boolean,
        completed: boolean
    }
) {
    const isCurrentMonth = day.currentMonth;

    const isToday = utils.sameDay(day.date, new Date());

    return (
        <div className={styles.calendarDayContainerWrapper}>
            <button
                className={classNames(
                    styles.calendarDayContainer,
                    { [styles.today]: isToday },
                    { [styles.notCurrentMonth]: !isCurrentMonth },
                    { [styles.hasChallenge]: hasChallenge },
                    { [styles.selected]: selected }
                )}
                onClick={() => onDayClick(day)}
            >
                <h1 className={classNames(
                    styles.calendarDayText,
                    { [styles.today]: isToday },
                    { [styles.notCurrentMonth]: !isCurrentMonth },
                    { [styles.hasChallenge]: hasChallenge },
                    { [styles.selected]: selected }
                )}>
                    {day.number}
                </h1>
            </button>
            {completed
                ? <div className={styles.dayChallengeCompleteIndicator}>!</div>
                : null
            }
        </div>
    );
}

function CalendarDays(
    {
        batchDays, visibleMonth, onDayClick
    }: {
        batchDays: BatchDay[], visibleMonth: Date, onDayClick: (day: CalendarDay) => void
    }) {
    const { currentDays } = useCalendarDays(visibleMonth);
    const [selectedDay, setSelectedDay] = useState<CalendarDay>({
        currentMonth: true,
        date: new Date(),
        month: new Date().getMonth(),
        number: new Date().getDate(),
        selected: true,
        year: new Date().getFullYear()
    });

    const daysWithChallenges = batchDays.map((challenge) => {
        return challenge.date.toDateString();
    });

    return (
        <>
            {
                currentDays.map((day: CalendarDay, index: number) => {
                    return (
                        <Day key={index}
                             day={day}
                             hasChallenge={daysWithChallenges.includes(day.date.toDateString())}
                             selected={selectedDay !== null && utils.sameDay(selectedDay.date, day.date)}
                             onDayClick={(day) => {
                                 setSelectedDay(day);
                                 onDayClick(day);
                             }}
                             completed={batchDays.find((batchDay) =>
                                 utils.sameDay(batchDay.date, day.date))?.challenges.every((challenge) =>
                                 challenge.completionDate !== null) ?? false}
                        />
                    );
                })
            }
        </>
    );
}

function CalendarGrid(
    {
        challenges, visibleMonth, onDayClick
    }: {
        challenges: BatchDay[],
        visibleMonth: Date, onDayClick: (day: CalendarDay) => void
    }
) {
    return (
        <div className={`${styles.calendarGridContainer}`}> {/*${styles.switched}*/}
            <WeekHeader />
            <CalendarDays batchDays={challenges} visibleMonth={visibleMonth} onDayClick={onDayClick} />
        </div>
    );
}

export function MyCalendar(
    {
        daysWithChallenges, onDayClickHandler
    }: {
        daysWithChallenges: BatchDay[],
        onDayClickHandler: (day: CalendarDay) => void
    }
) {
    const { visibleMonth, monthChangeActionHandler } = useVisibleMonth();

    return (
        <div className={`${styles.myCalendar}`}>
            <ChangeViewButtons visibleMonth={visibleMonth} onButtonClick={monthChangeActionHandler} />
            <CalendarGrid challenges={daysWithChallenges} visibleMonth={visibleMonth} onDayClick={onDayClickHandler} />
        </div>
    );
}